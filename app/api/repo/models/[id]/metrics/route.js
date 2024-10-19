import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { isAuthenticatedUser } from "@/utils/server/auth";
import { updateModelMetrics } from "@/server/controllers/modelController";

const router = createEdgeRouter();

dbConnect();

router.use(isAuthenticatedUser).patch(updateModelMetrics);

export async function PATCH(request, ctx) {
  return router.run(request, ctx);
}
