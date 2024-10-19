import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  let DB_URI = "";

  if (process.env.MY_NODE_ENV === "development") {
    DB_URI = process.env.DB_LOCAL_URI;
  } else if (process.env.MY_NODE_ENV === "production") {
    DB_URI = process.env.DB_URI;
  }

  mongoose.connect(DB_URI);
};

export default dbConnect;
