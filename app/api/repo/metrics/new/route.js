import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { newMetric } from "@/server/controllers/metricController";
import { isAuthenticatedUser } from "@/utils/server/auth";

const router = createEdgeRouter();

dbConnect();

router.use(isAuthenticatedUser).post(newMetric);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
