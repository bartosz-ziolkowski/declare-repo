"use server";

import { NextResponse } from "next/server";
import User from "@/database/models/user";
import { errorHandler } from "@/utils/server/errorHandler";

export const registerUser = errorHandler(async (req) => {
  const body = await req.json();
  const { name, email, password } = body;

  const user = await User.create({
    name,
    email,
    password,
  });

  return NextResponse.json({
    success: true,
  });
});
