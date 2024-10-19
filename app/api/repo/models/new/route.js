import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { newDeclareModel } from "@/server/controllers/modelController";
import { isAuthenticatedUser } from "@/utils/server/auth";

const router = createEdgeRouter();

dbConnect();

router.use(isAuthenticatedUser).post(newDeclareModel);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
