"use server";
import APIFilters from "@/utils/server/APIFilters";
import DeclareAndMetric from "@/database/models/declareAndMetric";
import Metric from "@/database/models/metric";
import { NextResponse } from "next/server";
import { errorHandler } from "@/utils/server/errorHandler";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

export const allMetrics = errorHandler(async (req) => {
  const resPerPage = 6;

  const { searchParams } = new URL(req.url);

  const queryStr = {};

  searchParams.forEach((value, key) => {
    queryStr[key] = value;
  });

  const apiFilters = new APIFilters(Metric.find(), queryStr);

  await apiFilters.search();
  apiFilters.filter();
  apiFilters.sort();

  const totalCount = await Metric.countDocuments();

  const filteredCount = await Metric.countDocuments(
    apiFilters.query.getFilter()
  );

  apiFilters.pagination(resPerPage);

  const metrics = await apiFilters.query.populate("author");

  return NextResponse.json({
    success: true,
    totalCount,
    filteredCount,
    resPerPage,
    metrics,
  });
});

export const getMetricDetails = errorHandler(async (req, { params }) => {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid metric ID" },
      { status: 400 }
    );
  }

  const metric = await Metric.findById(id);

  if (!metric) {
    return NextResponse.json(
      { success: false, message: "Metric not found" },
      { status: 404 }
    );
  }

  await metric.populate("author", "_id name email");

  return NextResponse.json({ success: true, metric });
});

export const updateMetricDetails = errorHandler(async (req, { params }) => {
  const { id } = params;
  const session = await getToken({ req });

  const { name, description, formula, reference } = await req.json();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid metric ID" },
      { status: 400 }
    );
  }

  const metric = await Metric.findById(id);

  if (!metric) {
    return NextResponse.json(
      { success: false, message: "Metric not found" },
      { status: 404 }
    );
  }

  if (session.user._id !== metric.author.toString()) {
    return NextResponse.json(
      { success: false, message: "You cannot edit not you metric" },
      { status: 404 }
    );
  }

  metric.name = name;
  metric.description = description;
  metric.formula = formula;
  metric.reference = reference;

  await metric.save();

  return NextResponse.json({ success: true });
});

export const newMetric = errorHandler(async (req) => {
  const body = await req.json();

  const newMetric = await Metric.create(body);

  return NextResponse.json({ success: true });
});

export const deleteMetric = errorHandler(async (req, { params }) => {
  const { id } = params;
  const session = await getToken({ req });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid metric ID" },
      { status: 400 }
    );
  }

  const metric = await Metric.findById(id);

  if (!metric) {
    return NextResponse.json(
      { success: false, message: "Metric not found" },
      { status: 404 }
    );
  }

  if (session.user._id !== metric.author.toString()) {
    return NextResponse.json(
      { success: false, message: "You cannot delete not you metric" },
      { status: 404 }
    );
  }

  await DeclareAndMetric.deleteMany({ metric: id });
  await Metric.findByIdAndDelete(id);

  return NextResponse.json({
    success: true,
    message: "Metric deleted successfully",
  });
});
