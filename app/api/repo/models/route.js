import { allModels } from "@/server/controllers/modelController";
import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { isAuthenticatedUser } from "@/utils/server/auth";
import { newDeclareModel } from "@/server/controllers/modelController";

const router = createEdgeRouter();

dbConnect();

router.get(allModels);
router.use(isAuthenticatedUser).post(newDeclareModel);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
