"use server";

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
import User from "@/database/models/user";
import { calculateMetrics } from "@/utils/server/metrics";
import { errorHandler } from "../../utils/server/errorHandler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

export const allModels = errorHandler(async (req) => {
	const resPerPage = 6;
	const session = await getToken({ req });

	const { searchParams } = new URL(req.url);
	const queryStr = {};

	searchParams.forEach((value, key) => {
		queryStr[key] = value;
	});

	let visibilityQuery = { public: true };

	if (session?.user) {
		if (session.user.role === "moderator" || session.user.role === "admin") {
			visibilityQuery = {};
		} else {
			visibilityQuery = {
				$or: [{ public: true }, { author: session.user._id, public: false }],
			};
		}
	}

	const baseQuery = DeclareModel.find(visibilityQuery);
	const apiFilters = new APIFilters(baseQuery, queryStr).filter().sort();
	apiFilters.search();

	const totalCount = await DeclareModel.countDocuments();
	const filteredCount = await DeclareModel.countDocuments(
		apiFilters.query.getFilter(),
	);

	apiFilters.paginate(resPerPage);

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
			{ status: 400 },
		);
	}

	const model = await DeclareModel.findById(id);

	if (!model) {
		return NextResponse.json(
			{ success: false, message: "Model not found" },
			{ status: 404 },
		);
	}

	await model.populate("author", "_id name email");

	const metrics = await DeclareAndMetric.find({ declareModel: id })
		.populate("metric", "ID name description formula")
		.lean();

	const transformedMetrics =
		metrics.length > 0
			? metrics.map((item) => ({
				ID: item.metric.ID,
				name: item.metric.name,
				description: item.metric.description,
				formula: item.metric.formula,
				calculationResult: item.calculationResult,
			}))
			: [];

	const domainMetric = await Metric.findOne({ ID: "SO2" });
	let allDomains = domainMetric
		? await DeclareAndMetric.distinct("calculationResult", {
			metric: domainMetric._id,
		})
		: [];

	const purposeMetric = await Metric.findOne({ ID: "SO1" });
	let allPurposes = purposeMetric
		? await DeclareAndMetric.distinct("calculationResult", {
			metric: purposeMetric._id,
		})
		: [];

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
	if (req.method !== "POST") {
		return NextResponse.json(
			{ success: false, message: "Invalid request method." },
			{ status: 405 }
		);
	}

	const session = await getToken({ req });
	let authorId;

	if (session?.user?._id) {
		authorId = session.user._id;
	} else {
		const fallbackUser = await User.findOne({ email: "tester@dtu.dk" });
		if (!fallbackUser) {
			return NextResponse.json(
				{ success: false, message: "Test user not found" },
				{ status: 500 }
			);
		}
		authorId = fallbackUser._id;
	}

	const contentType = req.headers.get("Content-Type");

	if (!["multipart/form-data", "application/x-www-form-urlencoded", "application/json"].some(ct => contentType.includes(ct))) {
		return NextResponse.json(
			{ success: false, message: "Invalid Content-Type header." },
			{ status: 400 }
		);
	}

	let body;
	if (contentType.includes("application/json")) {
		body = await req.json();
	} else {
		const formData = await req.formData();
		body = Object.fromEntries(formData.entries());
	}

	const modelData = {
		name: body.name || body["name"],
		description: body.description || body["description"],
		reference: {
			name: body.referenceName || body["referenceName"] || null,
			url: body.referenceUrl || body["referenceUrl"] || null,
		},
		contentURL: body.contentUrl || body["contentUrl"] || null,
		textRepURL: body.textRepUrl || body["textRepUrl"] || null,
		imageURL: body.imageUrl || body["imageUrl"] || null,
		automataUrl: body.automataUrl || body["automataUrl"] || null,
		author: authorId,
	};

	if (!modelData.name || !modelData.description) {
		return NextResponse.json(
			{ success: false, message: "'name' and 'description' are required fields." },
			{ status: 400 }
		);
	}

	let fileContent = null;
	if (modelData.contentURL && modelData.contentURL.trim() !== "") {
		const response = await fetch(modelData.contentURL);

		if (!response.ok) {
			return NextResponse.json(
				{ success: false, message: "Failed to fetch content from contentURL." },
				{ status: 400 }
			);
		}

		fileContent = await response.text();
		const result = isModelCorrect(fileContent);

		if (result !== "OK") {
			const urlsToDelete = [
				modelData.contentURL,
				modelData.imageURL,
				modelData.textRepURL,
				modelData.automataUrl,
			].filter(Boolean);

			for (const url of urlsToDelete) {
				const key = url.split("/").pop();
				const deleteCommand = new DeleteObjectCommand({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: key,
				});
				await s3Client.send(deleteCommand);
			}

			return NextResponse.json(
				{ success: false, message: result },
				{ status: 400 }
			);
		}
	}

	const metrics = fileContent
		? await calculateMetrics(fileContent, modelData.contentURL)
		: {
			SO1: "N/A",
			SO2: "N/A",
		};

	const declareModel = await DeclareModel.create(modelData);

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

	return NextResponse.json({ success: true, model: declareModel });
});


const isModelCorrect = (fileContent) => {
	const lines = fileContent.split("\n");

	const validActivityRegex = /^activity ([a-zA-Z][a-zA-Z0-9 _]*)$/;
	const validConstraintRegex =
		/^(Absence|Absence2|Absence3|Exactly1|Exactly2|Existence|Existence2|Existence3|Init|Alternate Precedence|Alternate Response|Alternate Succession|Chain Precedence|Chain Response|Chain Succession|Choice|Co-Existence|Exclusive Choice|Precedence|Responded Existence|Response|Succession|Not Chain Precedence|Not Chain Response|Not Chain Succession|Not Co-Existence|Not Precedence|Not Responded Existence|Not Response|Not Succession)\[([a-zA-Z][a-zA-Z0-9 _]*)(, [a-zA-Z][a-zA-Z0-9 _]*)*\]( *\| *)+$/;

	const definedActivities = new Set();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (line === "") continue;

		const activityMatch = line.match(validActivityRegex);
		if (activityMatch) {
			const activityName = activityMatch[1];
			if (definedActivities.has(activityName)) {
				return `Duplicate activity "${activityName}" on line ${i + 1}: "${line}"`;
			}
			definedActivities.add(activityName);
			continue;
		}

		const constraintMatch = line.match(validConstraintRegex);
		if (constraintMatch) {
			const terms = line
				.match(/\[([^\]]+)\]/)[1]
				.split(", ")
				.map((term) => term.trim());

			for (const term of terms) {
				if (!definedActivities.has(term)) {
					return `Undefined activity "${term}" on line ${i + 1}: "${line}"`;
				}
			}
			continue;
		}

		return `Invalid line format on line ${i + 1}: "${line}"`;
	}

	return "OK";
};

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

	if ((fileName !== "undefined") & (fileType !== "undefined")) {
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

	const { name, description, reference, public: visible } = await req.json();

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return NextResponse.json(
			{ success: false, message: "Invalid model ID" },
			{ status: 400 },
		);
	}

	const model = await DeclareModel.findById(id);

	if (!model) {
		return NextResponse.json(
			{ success: false, message: "Model not found" },
			{ status: 404 },
		);
	}

	if (session.user._id !== model.author.toString()) {
		if (session.user.role !== "moderator" && session.user.role !== "admin") {
			return NextResponse.json(
				{
					success: false,
					message: "You cannot edit a model that is not yours",
				},
				{ status: 403 },
			);
		}
	}

	model.name = name;
	model.description = description;
	model.reference = reference;
	model.public = visible;

	await model.save();

	return NextResponse.json({ success: true });
});

export const deleteModel = errorHandler(async (req, { params }) => {
	const { id } = params;
	const session = await getToken({ req });

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return NextResponse.json(
			{ success: false, message: "Invalid model ID" },
			{ status: 400 },
		);
	}

	const model = await DeclareModel.findById(id);

	if (!model) {
		return NextResponse.json(
			{ success: false, message: "Model not found" },
			{ status: 404 },
		);
	}

	if (session.user._id !== model.author.toString()) {
		if (session.user.role !== "moderator" && session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "You cannot delete not you model" },
				{ status: 404 },
			);
		}
	}

	const urlsToDelete = [
		model.contentURL,
		model.imageURL,
		model.textRepURL,
		model.automataUrl,
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
			{ status: 400 },
		);
	}

	const model = await DeclareModel.findById(id);

	if (!model) {
		return NextResponse.json(
			{ success: false, message: "Model not found" },
			{ status: 404 },
		);
	}

	if (session.user._id !== model.author.toString()) {
		if (session.user.role !== "moderator" && session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "You cannot edit not you model" },
				{ status: 404 },
			);
		}
	}

	const body = await req.json();

	const [metricId, newValue] = Object.entries(body)[0];

	const metric = await Metric.findOne({ ID: metricId });

	if (!metric) {
		return NextResponse.json(
			{ success: false, message: "Metric not found" },
			{ status: 404 },
		);
	}

	const updatedDeclareAndMetric = await DeclareAndMetric.findOneAndUpdate(
		{ declareModel: id, metric: metric._id },
		{ calculationResult: newValue },
		{ new: true, upsert: true },
	);

	if (!updatedDeclareAndMetric) {
		return NextResponse.json(
			{ success: false, message: "Failed to update metric" },
			{ status: 500 },
		);
	}

	return NextResponse.json({
		success: true,
		message: "Model's metric updated successfully",
	});
});

export const allModelsAndMetrics = errorHandler(async (req) => {
	const { searchParams } = new URL(req.url);
	const queryStr = {};

	searchParams.forEach((value, key) => {
		queryStr[key] = value;
	});

	const page = Number.parseInt(queryStr.page) || 1;
	const resPerPage = 6;
	const skip = (page - 1) * resPerPage;

	const pipeline = [
		{
			$lookup: {
				from: "declareModel",
				localField: "declareModel",
				foreignField: "_id",
				as: "modelData",
			},
		},
		{ $unwind: "$modelData" },
		{
			$lookup: {
				from: "metric",
				localField: "metric",
				foreignField: "_id",
				as: "metricData",
			},
		},
		{ $unwind: "$metricData" },
		{
			$group: {
				_id: "$declareModel",
				modelName: { $first: "$modelData.name" },
				modelCreatedAt: { $first: "$modelData.createdAt" },
				public: { $first: "$modelData.public" },
				metrics: {
					$push: {
						metricId: "$metricData._id",
						metricID: "$metricData.ID",
						metricName: "$metricData.name",
						formula: "$metricData.formula",
						calculationResult: "$calculationResult",
					},
				},
			},
		},
		{ $sort: { modelName: 1 } },
		{ $skip: skip },
		{ $limit: resPerPage },
	];

	const modelsWithMetrics = await DeclareAndMetric.aggregate(pipeline);

	const totalCountPipeline = [
		{
			$group: {
				_id: "$declareModel",
			},
		},
		{
			$count: "total",
		},
	];
	const [totalCountResult] =
		await DeclareAndMetric.aggregate(totalCountPipeline);
	const totalCount = totalCountResult ? totalCountResult.total : 0;

	return NextResponse.json({
		success: true,
		totalCount,
		filteredCount: totalCount,
		resPerPage,
		modelsWithMetrics,
	});
});
