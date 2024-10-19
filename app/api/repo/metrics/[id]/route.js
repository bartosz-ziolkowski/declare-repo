import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { deleteMetric } from "@/server/controllers/metricController";
import { getMetricDetails } from "@/server/controllers/metricController";
import { isAuthenticatedUser } from "@/utils/server/auth";
import { updateMetricDetails } from "@/server/controllers/metricController";

const router = createEdgeRouter();

dbConnect();

router.get(getMetricDetails);
router.use(isAuthenticatedUser).patch(updateMetricDetails);
router.use(isAuthenticatedUser).delete(deleteMetric);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}

export async function PATCH(request, ctx) {
  return router.run(request, ctx);
}

export async function DELETE(request, ctx) {
  return router.run(request, ctx);
}
