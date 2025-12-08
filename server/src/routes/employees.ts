import { Router, Request, Response, NextFunction } from "express";
import { Employee } from "../models/Employee";
import { requireAnyRole, canAccessProvince, AuthenticatedUser } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";
import { validateAndResolveProvinceId } from "../utils/provinceValidation";

const router = Router({ mergeParams: true });

type EmployeeParams = { provinceId: string; employeeId: string };
type ProvinceScopedBody = Record<string, unknown> & { provinceId?: string };
type EmployeeDocument = NonNullable<Awaited<ReturnType<typeof Employee.findById>>>;

const ensureUser = (req: Request): AuthenticatedUser => {
	if (!req.user) {
		throw new HttpError(401, "User context missing");
	}
	return req.user;
};

// Helper function to validate user can access the province and fetch employee
// Throws HttpError if employee not found or access denied
const getEmployeeInProvinceOrThrow = async (
	req: Request<EmployeeParams>,
	provinceId: string
): Promise<EmployeeDocument> => {
	const user = ensureUser(req);

	// Check if user can access this province
	if (!canAccessProvince(user, provinceId)) {
		throw new HttpError(403, "Cannot access employees from another province");
	}

	const employee = await Employee.findById(req.params.employeeId).populate('provinceId');
	if (!employee) {
		throw new HttpError(404, "Employee not found");
	}

	const employeeProvinceId = employee.provinceId?._id?.toString?.();
	if (employeeProvinceId !== provinceId) {
		throw new HttpError(400, "Employee does not belong to the specified province");
	}

	return employee;
};

// GET /provinces/:provinceId/employees - List employees of a province
router.get("/", requireAnyRole, async (req: Request<{ provinceId: string }>, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
		const { provinceId } = req.params;

		// Check if user can access this province
		if (!canAccessProvince(user, provinceId)) {
			throw new HttpError(403, "Cannot access employees from another province");
		}

		const employees = await Employee.find({ provinceId }).populate('provinceId');
		res.json(employees);
	} catch (err: unknown) {
		next(err);
	}
});

// POST /provinces/:provinceId/employees - Create employee in a province
router.post("/", requireAnyRole, async (req: Request<{ provinceId: string }, any, ProvinceScopedBody>, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
		const { provinceId } = req.params;

		// Check if user can access this province
		if (!canAccessProvince(user, provinceId)) {
			throw new HttpError(403, "Cannot create employee in another province");
		}

		const employee = new Employee({
			...req.body,
			provinceId
		});
		await employee.save();
		res.status(201).json(employee);
	} catch (err: unknown) {
		next(err);
	}
});

// GET /provinces/:provinceId/employees/:employeeId - Get single employee
router.get("/:employeeId", requireAnyRole, async (req: Request<EmployeeParams>, res: Response, next: NextFunction) => {
	try {
		const { provinceId, employeeId } = req.params;
		const employee = await getEmployeeInProvinceOrThrow(req, provinceId);
		res.json(employee);
	} catch (err: unknown) {
		next(err);
	}
});

// PUT /provinces/:provinceId/employees/:employeeId - Update employee
router.put("/:employeeId", requireAnyRole, async (req: Request<EmployeeParams, any, ProvinceScopedBody>, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
		const { provinceId, employeeId } = req.params;

		// Verify employee exists and belongs to province
		await getEmployeeInProvinceOrThrow(req, provinceId);

		// Prevent provinceId from being changed via PUT
		const updateData = { ...req.body };
		if (updateData.provinceId && updateData.provinceId !== provinceId) {
			throw new HttpError(400, "Cannot move employee to a different province");
		}
		delete updateData.provinceId;

		const updated = await Employee.findByIdAndUpdate(employeeId, updateData, { new: true }).populate('provinceId');

		if (!updated) {
			throw new HttpError(404, "Employee not found");
		}

		res.json(updated);
	} catch (err: unknown) {
		next(err);
	}
});

// DELETE /provinces/:provinceId/employees/:employeeId - Delete employee
router.delete("/:employeeId", requireAnyRole, async (req: Request<EmployeeParams>, res: Response, next: NextFunction) => {
	try {
		const { provinceId, employeeId } = req.params;

		// Verify employee exists and belongs to province
		await getEmployeeInProvinceOrThrow(req, provinceId);

		const deleted = await Employee.findByIdAndDelete(employeeId);
		if (!deleted) {
			throw new HttpError(404, "Employee not found");
		}
		res.json({ message: "Employee deleted" });
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
