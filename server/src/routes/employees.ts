import { Router } from "express";
import { Employee } from "../models/Employee";
import { auth } from "../middleware/auth";

const router = Router();

// Global admin: can see all employees
router.get("/", auth("globalAdmin"), async (_, res) => {
    try {
        const employees = await Employee.find().populate('province');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Province admin: can see only their province employees
router.get("/my-province", auth("provinceAdmin"), async (req: any, res) => {
    try {
        const employees = await Employee.find({ province: req.user.provinceId }).populate('province');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Get single employee - Global admin can view any employee, province admin can view their province employees
router.get("/:id", async (req: any, res) => {
    try {
        // Check authentication
        if (!req.session.userId || !req.session.role) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const employee = await Employee.findById(req.params.id).populate('province');
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Province admins can only view employees in their province
        if (req.session.role === "provinceAdmin") {
            if (employee.province._id.toString() !== req.session.provinceId) {
                return res.status(403).json({ error: "Cannot view employees from other provinces" });
            }
        }

        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employee" });
    }
});

// Create employee - Global admin can create for any province, province admin for their own
router.post("/", async (req: any, res) => {
    try {
        // Check authentication
        if (!req.session.userId || !req.session.role) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        // Province admins can only create in their own province
        if (req.session.role === "provinceAdmin") {
            if (req.body.province !== req.session.provinceId) {
                return res.status(403).json({ error: "Can only create employees in your own province" });
            }
        }

        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json(employee);
    } catch (err) {
        res.status(400).json({ error: "Invalid employee data" });
    }
});

// Update employee - Global admin can update any employee, province admin can update their own province employees
router.put("/:id", async (req: any, res) => {
    try {
        // Check authentication
        if (!req.session.userId || !req.session.role) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Province admins can only update employees in their province
        if (req.session.role === "provinceAdmin") {
            if (employee.province.toString() !== req.session.provinceId) {
                return res.status(403).json({ error: "Can only update employees in your own province" });
            }
        }

        const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('province');
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: "Invalid employee data" });
    }
});

// Delete employee - Global admin can delete any employee, province admin can delete their own province employees
router.delete("/:id", async (req: any, res) => {
    try {
        // Check authentication
        if (!req.session.userId || !req.session.role) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Province admins can only delete employees in their province
        if (req.session.role === "provinceAdmin") {
            if (employee.province.toString() !== req.session.provinceId) {
                return res.status(403).json({ error: "Can only delete employees in your own province" });
            }
        }

        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: "Employee deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete employee" });
    }
});

export default router;
