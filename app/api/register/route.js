import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { registerUser } from "@/server/controllers/userController";

const router = createEdgeRouter();

dbConnect();

router.post(registerUser);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
