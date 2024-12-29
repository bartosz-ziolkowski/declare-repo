"use server";

import APIFilters from "@/utils/server/APIFilters";
import DeclareAndMetric from "@/database/models/declareAndMetric";
import Metric from "@/database/models/metric";
import { NextResponse } from "next/server";
import { errorHandler } from "@/utils/server/errorHandler";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import User from "@/database/models/user";

export const allMetrics = errorHandler(async (req) => {
	const resPerPage = 6;

	const { searchParams } = new URL(req.url);
	const queryStr = {};

	searchParams.forEach((value, key) => {
		queryStr[key] = value;
	});

	const apiFilters = new APIFilters(Metric.find(), queryStr).filter().sort();

	apiFilters.search();

	const totalCount = await Metric.countDocuments();

	const filteredCount = await Metric.countDocuments(
		apiFilters.query.getFilter(),
	);

	apiFilters.paginate(resPerPage);

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
			{ status: 400 },
		);
	}

	const metric = await Metric.findById(id);

	if (!metric) {
		return NextResponse.json(
			{ success: false, message: "Metric not found" },
			{ status: 404 },
		);
	}

	await metric.populate("author", "_id name email");

	return NextResponse.json({ success: true, metric });
});

export const updateMetricDetails = errorHandler(async (req, { params }) => {
	const { id } = params;
	const session = await getToken({ req });

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return NextResponse.json(
			{ success: false, message: "Invalid metric ID" },
			{ status: 400 },
		);
	}

	const metric = await Metric.findById(id);

	if (!metric) {
		return NextResponse.json(
			{ success: false, message: "Metric not found" },
			{ status: 404 },
		);
	}

	if (
		session.user._id !== metric.author.toString() &&
		session.user.role !== "moderator" &&
		session.user.role !== "admin"
	) {
		return NextResponse.json(
			{ success: false, message: "You cannot edit not your metric" },
			{ status: 403 },
		);
	}

	const {
		name,
		description,
		formula,
		reference,
		public: isPublic,
	} = await req.json();

	const updates = {};

	if (name && name !== metric.name) {
		updates.name = name;
	}

	if (description && description !== metric.description) {
		updates.description = description;
	}

	if (formula && formula !== metric.formula) {
		updates.formula = formula;
	}

	if (
		reference &&
		JSON.stringify(reference) !== JSON.stringify(metric.reference)
	) {
		updates.reference = reference;
	}

	if (typeof isPublic === "boolean" && isPublic !== metric.public) {
		updates.public = isPublic;
	}

	if (Object.keys(updates).length > 0) {
		await Metric.findByIdAndUpdate(id, updates);
	}

	return NextResponse.json({
		success: true,
		message:
			Object.keys(updates).length > 0
				? "Metric updated successfully"
				: "No updates were necessary",
	});
});

export const newMetric = errorHandler(async (req) => {
  const session = await getToken({ req });
  const body = await req.json();

  let authorId;

  if (session && session.user && session.user.id) {
    authorId = session.user.id;
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

  const newMetric = await Metric.create({ ...body, author: authorId });

  return NextResponse.json({ success: true, data: newMetric }, { status: 201 });
});

export const deleteMetric = errorHandler(async (req, { params }) => {
	const { id } = params;
	const session = await getToken({ req });

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return NextResponse.json(
			{ success: false, message: "Invalid metric ID" },
			{ status: 400 },
		);
	}

	const metric = await Metric.findById(id);

	if (!metric) {
		return NextResponse.json(
			{ success: false, message: "Metric not found" },
			{ status: 404 },
		);
	}

	if (session.user._id !== metric.author.toString()) {
		if (session.user.role !== "moderator" && session.user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "You cannot delete not you metric" },
				{ status: 404 },
			);
		}
	}

	await DeclareAndMetric.deleteMany({ metric: id });
	await Metric.findByIdAndDelete(id);

	return NextResponse.json({
		success: true,
		message: "Metric deleted successfully",
	});
});
