import { NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

export const isAuthenticatedUser = async (
  req,
  event,
  next
) => {
  const session = await getToken({ req });

  if (!session) {
    return NextResponse.json(
      {
        message: "Login first to access this route",
      },
      { status: 401 }
    );
  }

  req.user = session.user;

  return next();
};