import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { uploadModelFiles } from "@/server/controllers/modelController";
import { isAuthenticatedUser } from "@/utils/server/auth";

const router = createEdgeRouter();

dbConnect();

router.use(isAuthenticatedUser).post(uploadModelFiles);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
