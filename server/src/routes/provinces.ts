import { Router, Request, Response, NextFunction } from "express";
import { Province } from "../models/Province";
import { auth } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";

const router = Router();

// GET /provinces - List all provinces (Global Admin only)
router.get("/", auth(USER_ROLE.GLOBAL_ADMIN), async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const provinces = await Province.find().populate('admin');
		res.json(provinces);
	} catch (err: unknown) {
		next(err);
	}
});

// GET /provinces/:provinceId - Get a specific province
router.get("/:provinceId", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const province = await Province.findById(req.params.provinceId).populate('admin');
		if (!province) {
			throw new HttpError(404, "Province not found");
		}
		res.json(province);
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
