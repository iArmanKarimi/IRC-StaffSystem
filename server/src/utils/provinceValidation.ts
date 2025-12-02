import mongoose from "mongoose";
import { Province } from "../models/Province";
import { AuthenticatedUser } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "./errors";

/**
 * Validates and resolves provinceId for employee operations
 * - Province admins are restricted to their own province
 * - Global admins can specify any province
 * Returns the validated provinceId string
 */
export async function validateAndResolveProvinceId(
	user: AuthenticatedUser,
	requestedProvinceId: string | undefined
): Promise<string> {
	let provinceId: string | undefined = requestedProvinceId;

	// Province admins can only use their own province
	if (user.role === USER_ROLE.PROVINCE_ADMIN) {
		if (!user.provinceId) {
			throw new HttpError(400, "Province context missing for province admin");
		}
		if (provinceId && provinceId !== user.provinceId) {
			console.warn(`Province admin ${user.id} attempted to use province ${provinceId} instead of ${user.provinceId}`);
		}
		provinceId = user.provinceId;
	}

	if (!provinceId) {
		throw new HttpError(400, "provinceId is required");
	}

	// Validate ObjectId format
	if (!mongoose.Types.ObjectId.isValid(provinceId)) {
		throw new HttpError(400, "Invalid provinceId format");
	}

	// Verify province exists
	const province = await Province.findById(provinceId);
	if (!province) {
		throw new HttpError(400, "Province not found");
	}

	return provinceId;
}

