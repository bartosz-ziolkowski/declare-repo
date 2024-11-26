import DeclareAndMetric from "./models/declareAndMetric.js";
import DeclareModel from "./models/declareModel.js";
import Metric from "./models/metric.js";
import dbConnect from "./dbConnect.js";
import dotenv from "dotenv";
import { mockDeclareModels } from "../utils/data/mockDeclareModels.js";
import { mockMetrics } from "../utils/data/mockMetrics.js";
import mongoose from "mongoose";

dotenv.config();

const seed = async () => {
  try {
    dbConnect();

    await DeclareModel.deleteMany();
    //await DeclareModel.insertMany(mockDeclareModels);

    await DeclareAndMetric.deleteMany();
    await Metric.deleteMany();
    await Metric.insertMany(mockMetrics);

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seed();
