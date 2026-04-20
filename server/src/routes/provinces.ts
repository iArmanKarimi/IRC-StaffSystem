import { Router, Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import path from "path";
import fs from "fs";
import { Province } from "../models/Province";
import { auth, canAccessProvince, requireAnyRole } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";
import { sendSuccess } from "../utils/response";
import { logger } from "../middleware/logger";

const router = Router();

const IMAGE_DIR = path.join(__dirname, "../img");

const getProvinceImageFile = (provinceName: string): string | undefined => {
	// Primary inference rule: use the exact province name + .jpg (client expectation)
	const jpgCandidate = `${provinceName}.jpg`;
	if (fs.existsSync(path.join(IMAGE_DIR, jpgCandidate))) return jpgCandidate;

	// Fallback: support .png assets if they exist to avoid breaking existing files
	const pngCandidate = `${provinceName}.png`;
	if (fs.existsSync(path.join(IMAGE_DIR, pngCandidate))) return pngCandidate;

	return undefined;
};

const withImageUrl = (province: any, req: Request) => {
	const fileName = getProvinceImageFile(province.name);
	const host = req.get("host");
	const protocol = req.get("x-forwarded-proto") || req.protocol;
	const imageUrl = fileName && host ? `${protocol}://${host}/img/${encodeURIComponent(fileName)}` : undefined;

	return {
		...province.toObject(),
		imageUrl
	};
};

// Middleware to validate provinceId parameter
const validateProvinceId = (req: Request, res: Response, next: NextFunction) => {
	const { provinceId } = req.params;
	if (!isValidObjectId(provinceId)) {
		return res.status(400).json({ success: false, error: "Invalid province ID format" });
	}
	next();
};

const getProvinceIdParam = (req: Request): string => {
	const { provinceId } = req.params;

	if (typeof provinceId !== "string") {
		throw new HttpError(400, "Invalid province ID format");
	}

	return provinceId;
};

const validateProvinceAccess = (req: Request, provinceId: string) => {
	if (!req.user) {
		throw new HttpError(401, "User context missing");
	}

	if (!canAccessProvince(req.user, provinceId)) {
		throw new HttpError(403, "Cannot access another province");
	}
};

// GET /provinces - List all provinces (Global Admin only)
router.get("/", auth(USER_ROLE.GLOBAL_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const provinces = await Province.find().populate({
			path: 'admin',
			select: '_id username role provinceId'
		});
		const provincesWithImages = provinces.map((province) => withImageUrl(province, req));
		logger.debug("Provinces listed", { count: provinces.length });
		sendSuccess(res, provincesWithImages, 200, "Provinces retrieved successfully");
	} catch (err: unknown) {
		next(err);
	}
});

// GET /provinces/:provinceId - Get a specific province
router.get("/:provinceId", validateProvinceId, requireAnyRole, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const provinceId = getProvinceIdParam(req);
		validateProvinceAccess(req, provinceId);

		const province = await Province.findById(provinceId).populate({
			path: 'admin',
			select: '_id username role provinceId'
		});
		if (!province) {
			throw new HttpError(404, "Province not found");
		}
		logger.debug("Province retrieved", { provinceId });
		sendSuccess(res, withImageUrl(province, req), 200, "Province retrieved successfully");
	} catch (err: unknown) {
		next(err);
	}
});

// POST /provinces/:provinceId/toggle-lock - Toggle a province performance lock
router.post("/:provinceId/toggle-lock", validateProvinceId, requireAnyRole, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const provinceId = getProvinceIdParam(req);
		validateProvinceAccess(req, provinceId);

		const province = await Province.findById(provinceId).populate({
			path: 'admin',
			select: '_id username role provinceId'
		});

		if (!province) {
			throw new HttpError(404, "Province not found");
		}

		province.is_locked = !province.is_locked;
		await province.save();

		logger.info("Province performance lock toggled", {
			provinceId,
			locked: province.is_locked,
			userId: req.user?.id,
		});

		sendSuccess(res, withImageUrl(province, req), 200, "Province lock updated successfully");
	} catch (err: unknown) {
		next(err);
	}
});

// Mount employee routes as nested routes
import employeeRoutes from './employees';
router.use('/:provinceId/employees', employeeRoutes);

export default router;
