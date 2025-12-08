import { Request, Response, NextFunction } from "express";

export interface RequestLogger {
	info(message: string, data?: Record<string, unknown>): void;
	warn(message: string, data?: Record<string, unknown>): void;
	error(message: string, error?: Error | unknown): void;
	debug(message: string, data?: Record<string, unknown>): void;
}

class Logger implements RequestLogger {
	private timestamp(): string {
		return new Date().toISOString();
	}

	private formatLog(level: string, message: string, data?: unknown): void {
		const logEntry: Record<string, unknown> = {
			timestamp: this.timestamp(),
			level,
			message
		};
		if (data) {
			logEntry.data = data;
		}
		console.log(JSON.stringify(logEntry));
	}

	info(message: string, data?: Record<string, unknown>): void {
		this.formatLog("INFO", message, data);
	}

	warn(message: string, data?: Record<string, unknown>): void {
		this.formatLog("WARN", message, data);
	}

	error(message: string, error?: Error | unknown): void {
		const errorData = error instanceof Error
			? { message: error.message, stack: error.stack }
			: { error };
		this.formatLog("ERROR", message, errorData);
	}

	debug(message: string, data?: Record<string, unknown>): void {
		if (process.env.DEBUG === "true") {
			this.formatLog("DEBUG", message, data);
		}
	}
}

export const logger = new Logger();

/**
 * Request logging middleware
 * Logs incoming requests and response status
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
	const startTime = Date.now();
	const { method, path, ip } = req;

	// Log request
	logger.debug("Incoming request", {
		method,
		path,
		ip
	});

	// Override res.json to log response
	const originalJson = res.json.bind(res);
	res.json = function (data: unknown) {
		const duration = Date.now() - startTime;
		const statusCode = res.statusCode;

		logger.info("Request completed", {
			method,
			path,
			statusCode,
			duration: `${duration}ms`,
			ip
		});

		return originalJson(data);
	};

	next();
}
