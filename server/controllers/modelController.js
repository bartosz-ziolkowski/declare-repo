import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import APIFilters from "../../utils/server/APIFilters";
import DeclareAndMetric from "@/database/models/declareAndMetric";
import DeclareModel from "../../database/models/declareModel";
import Metric from "@/database/models/metric";
import { NextResponse } from "next/server";
import { calculateMetrics } from "@/utils/server/metrics";
import { errorHandler } from "../../utils/server/errorHandler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

export const allModels = errorHandler(async (req) => {
  const resPerPage = 6;

  const { searchParams } = new URL(req.url);
  const queryStr = {};

  searchParams.forEach((value, key) => {
    queryStr[key] = value;
  });

  const apiFilters = new APIFilters(DeclareModel.find(), queryStr);

  await apiFilters.search();
  apiFilters.filter();
  apiFilters.sort();

  const totalCount = await DeclareModel.countDocuments();

  const filteredCount = await DeclareModel.countDocuments(
    apiFilters.query.getFilter()
  );

  apiFilters.pagination(resPerPage);

  const models = await apiFilters.query.populate("author");

  return NextResponse.json({
    success: true,
    totalCount,
    filteredCount,
    resPerPage,
    models,
  });
});

export const getModelDetails = errorHandler(async (req, { params }) => {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid model ID" },
      { status: 400 }
    );
  }

  const model = await DeclareModel.findById(id);

  if (!model) {
    return NextResponse.json(
      { success: false, message: "Model not found" },
      { status: 404 }
    );
  }

  await model.populate("author", "_id name email");

  const metrics = await DeclareAndMetric.find({ declareModel: id })
    .populate("metric", "ID name description formula")
    .lean();

  const transformedMetrics = metrics.map((item) => ({
    ID: item.metric.ID,
    name: item.metric.name,
    description: item.metric.description,
    formula: item.metric.formula,
    calculationResult: item.calculationResult,
  }));

 const domainMetric = await Metric.findOne({ ID: "SM1" });
 let allDomains = await DeclareAndMetric.distinct("calculationResult", {
   metric: domainMetric._id,
 });

 const purposeMetric = await Metric.findOne({ ID: "SM3" });
 let allPurposes = await DeclareAndMetric.distinct("calculationResult", {
   metric: purposeMetric._id,
 });

 const uniqueCaseInsensitive = (arr) => {
   const lowercaseSet = new Set();
   return arr.filter((item) => {
     const lowercase = item.toLowerCase().trim();
     if (lowercase === "") return false;
     if (lowercaseSet.has(lowercase)) return false;
     lowercaseSet.add(lowercase);
     return true;
   });
 };

 allDomains = uniqueCaseInsensitive(allDomains);
 allPurposes = uniqueCaseInsensitive(allPurposes);

  return NextResponse.json({
    success: true,
    model,
    metrics: transformedMetrics,
    allDomains,
    allPurposes,
  });
});

export const newDeclareModel = errorHandler(async (req) => {
  const body = await req.formData();

  const modelData = {
    name: body.get("name"),
    description: body.get("description"),
    reference: {
      name: body.get("referenceName"),
      url: body.get("referenceUrl"),
    },
    contentURL: body.get("contentUrl"),
    textRepURL: body.get("textRepUrl"),
    imageURL: body.get("imageUrl"),
    author: body.get("author"),
  };

  let fileContent = null;
  if (modelData.contentURL && modelData.contentURL.trim() !== "") {
    const response = await fetch(modelData.contentURL);
    fileContent = await response.text();
  }

  const declareModel = await DeclareModel.create(modelData);

  const metrics = calculateMetrics(fileContent);

  for (const [metricId, value] of Object.entries(metrics)) {
    const metric = await Metric.findOne({ ID: metricId });
    if (metric) {
      await DeclareAndMetric.create({
        declareModel: declareModel._id,
        metric: metric._id,
        calculationResult: value,
      });
    }
  }

  return NextResponse.json({ success: true });
});

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadModelFiles = errorHandler(async (req) => {
  const body = await req.formData();

  const fileName = body.get("fileName");
  const fileType = body.get("fileType");

  if ((fileName != "undefined") & (fileType != "undefined")) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 120,
    });
    return NextResponse.json({ signedUrl });
  }
});

export const updateModelDetails = errorHandler(async (req, { params }) => {
  const { id } = params;
  const session = await getToken({ req });

  const { name, description, reference } = await req.json();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid model ID" },
      { status: 400 }
    );
  }

  const model = await DeclareModel.findById(id);

  if (!model) {
    return NextResponse.json(
      { success: false, message: "Model not found" },
      { status: 404 }
    );
  }

  if (session.user._id !== model.author.toString()) {
    return NextResponse.json(
      { success: false, message: "You cannot edit not you model" },
      { status: 404 }
    );
  }

  model.name = name;
  model.description = description;
  model.reference = reference;

  await model.save();

  return NextResponse.json({ success: true });
});

export const deleteModel = errorHandler(async (req, { params }) => {
  const { id } = params;
  const session = await getToken({ req });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid model ID" },
      { status: 400 }
    );
  }

  const model = await DeclareModel.findById(id);

  if (!model) {
    return NextResponse.json(
      { success: false, message: "Model not found" },
      { status: 404 }
    );
  }

  if (session.user._id !== model.author.toString()) {
    return NextResponse.json(
      { success: false, message: "You cannot delete not you model" },
      { status: 404 }
    );
  }

  const urlsToDelete = [
    model.contentURL,
    model.imageURL,
    model.textRepURL,
  ].filter(Boolean);

  for (const url of urlsToDelete) {
    const key = url.split("/").pop();
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);
  }

  await DeclareAndMetric.deleteMany({ declareModel: id });
  await DeclareModel.findByIdAndDelete(id);

  return NextResponse.json({
    success: true,
    message: "Model and associated files deleted successfully",
  });
});

export const updateModelMetrics = errorHandler(async (req, { params }) => {
  const { id } = params;
  const session = await getToken({ req });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid model ID" },
      { status: 400 }
    );
  }

  const model = await DeclareModel.findById(id);

  if (!model) {
    return NextResponse.json(
      { success: false, message: "Model not found" },
      { status: 404 }
    );
  }

  if (session.user._id !== model.author.toString()) {
    return NextResponse.json(
      { success: false, message: "You cannot edit not you model" },
      { status: 404 }
    );
  }

  const body = await req.json();

  const [metricId, newValue] = Object.entries(body)[0];

  const metric = await Metric.findOne({ ID: metricId });

  if (!metric) {
    return NextResponse.json(
      { success: false, message: "Metric not found" },
      { status: 404 }
    );
  }

  const updatedDeclareAndMetric = await DeclareAndMetric.findOneAndUpdate(
    { declareModel: id, metric: metric._id },
    { calculationResult: newValue },
    { new: true, upsert: true }
  );

  if (!updatedDeclareAndMetric) {
    return NextResponse.json(
      { success: false, message: "Failed to update metric" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Model's metric updated successfully",
  });
});
