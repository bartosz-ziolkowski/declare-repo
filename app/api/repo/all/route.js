import { allModelsAndMetrics } from "@/server/controllers/modelController";
import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";

const router = createEdgeRouter();

dbConnect();

router.get(allModelsAndMetrics);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
