import { Request, Response, NextFunction } from "express";
import { Province } from "../models/Province";

/**
 * Middleware to check if a province's performance records are locked
 * Used before performance update/reset operations
 * Returns 423 Locked if the current province is locked
 */
export const checkPerformanceLocked = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { provinceId } = req.params;

		if (!provinceId) {
			return next();
		}

		const province = await Province.findById(provinceId).select("is_locked");

		if (province?.is_locked) {
			return res.status(423).json({
				success: false,
				error: "Performance records are locked for this province",
				code: "PERFORMANCE_LOCKED",
			});
		}

		next();
	} catch (err) {
		// If there's an error checking lock status, allow the operation
		// (fail-open approach for availability)
		next();
	}
};
