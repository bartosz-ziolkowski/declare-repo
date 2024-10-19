import { NextResponse } from "next/server";

export const errorHandler = (handler) => async (req, params) => {
  try {
    return await handler(req, params);
  } catch (error) {
    if (error?.name === "CastError") {
      error.message = `Resource not found. Invalid ${error?.path}`;
      error.statusCode = 400;
    }

    if (error?.name === "ValidationError") {
      const messages = [];

      if (error.errors && typeof error.errors === "object") {
        Object.values(error.errors).forEach((value) => {
          if (value.message) {
            messages.push(value.message);
          }
        });
      }

      error.message = messages;
      error.statusCode = 400;
    }

    if (error.code === 11000 || error.code === 409) {
      error.message = `Duplicate ${Object.keys(error.keyValue)} entered`;
      error.statusCode = 409;
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.statusCode || 500,
      }
    );
  }
};
