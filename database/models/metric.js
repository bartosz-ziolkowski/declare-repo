import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    ID: {
      type: String,
      required: [true, "Please enter a unique ID"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[A-Z]{2}\d+$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid ID! ID must be two capital letters followed by a number.`,
      },
    },
    name: {
      type: String,
      required: [true, "Please enter metric name"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter metric description"],
    },
    formula: {
      type: String,
      default: "Unspecified",
    },
    reference: {
      name: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return (
              v === null ||
              v === "" ||
              /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})(\/[-\w\._~:/?#[\]@!$&'()*+,;=]*)*\/?$/.test(
                v
              )
            );
          },
          message: (props) => `${props.value} is not a valid URL!`,
        },
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
    },
  },
  { timestamps: true }
);

const Metric =
  mongoose.models.Metric || mongoose.model("Metric", metricSchema, "metric");

export default Metric;
