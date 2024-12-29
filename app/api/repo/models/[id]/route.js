import { createEdgeRouter } from "next-connect";
import dbConnect from "@/database/dbConnect";
import { deleteModel } from "@/server/controllers/modelController";
import { getModelDetails } from "@/server/controllers/modelController";
import { isAuthenticatedUser } from "@/utils/server/auth";
import { updateModelDetails } from "@/server/controllers/modelController";

const router = createEdgeRouter();

dbConnect();

router.get(getModelDetails);
router.use(isAuthenticatedUser).patch(updateModelDetails);
router.use(isAuthenticatedUser).delete(deleteModel);

export async function GET(request, ctx) {
	return router.run(request, ctx);
}

export async function PATCH(request, ctx) {
	return router.run(request, ctx);
}

export async function DELETE(request, ctx) {
	return router.run(request, ctx);
}
