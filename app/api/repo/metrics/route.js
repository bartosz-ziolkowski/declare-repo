import { allMetrics } from "@/server/controllers/metricController";
import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { isAuthenticatedUser } from "@/utils/server/auth";
import { newMetric } from "@/server/controllers/metricController";

const router = createEdgeRouter();

dbConnect();

router.get(allMetrics);
router.use(isAuthenticatedUser).post(newMetric);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
