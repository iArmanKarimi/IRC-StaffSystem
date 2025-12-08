import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors";
import { logger } from "./logger";

/**
 * Centralized error handler middleware
 * Handles HttpError instances and other errors consistently
 */
export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	if (err instanceof HttpError) {
		logger.warn("HTTP Error", {
			statusCode: err.statusCode,
			message: err.message,
			path: req.path,
			method: req.method
		});
		res.status(err.statusCode).json({
			success: false,
			error: err.message
		});
		return;
	}

	// Handle Mongoose validation errors
	if (err && typeof err === "object" && "name" in err && err.name === "ValidationError") {
		logger.warn("Validation Error", {
			path: req.path,
			error: err
		});
		res.status(400).json({
			success: false,
			error: "Validation error",
			details: err
		});
		return;
	}

	// Handle Mongoose cast errors (invalid ObjectId, etc.)
	if (err && typeof err === "object" && "name" in err && err.name === "CastError") {
		logger.warn("Cast Error", {
			path: req.path
		});
		res.status(400).json({
			success: false,
			error: "Invalid ID format"
		});
		return;
	}

	// Handle duplicate key errors (Mongoose)
	if (err && typeof err === "object" && "code" in err && err.code === 11000) {
		logger.warn("Duplicate Key Error", {
			path: req.path,
			keys: err
		});
		res.status(409).json({
			success: false,
			error: "A record with this information already exists"
		});
		return;
	}

	// Log unexpected errors
	logger.error("Unexpected server error", err);

	// Generic error response
	res.status(500).json({
		success: false,
		error: "Internal server error"
	});
}


