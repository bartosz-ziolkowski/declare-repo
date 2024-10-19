import mongoose from "mongoose";

const declareAndMetricSchema = new mongoose.Schema(
  {
    declareModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeclareModel",
      required: true,
    },
    metric: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metric",
      required: true,
    },
    calculationResult: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    associationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

declareAndMetricSchema.index({ declareModel: 1, metric: 1 }, { unique: true });

const DeclareAndMetric =
  mongoose.models.DeclareAndMetric ||
  mongoose.model(
    "DeclareAndMetric",
    declareAndMetricSchema,
    "declareAndMetric"
  );

export default DeclareAndMetric;
