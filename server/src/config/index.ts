import dotenv from "dotenv";

dotenv.config();

export interface ServerConfig {
	port: number;
	nodeEnv: "development" | "production" | "test";
	cors: {
		origin: string;
		credentials: boolean;
	};
	session: {
		secret: string;
		maxAge: number;
	};
	mongodb: {
		uri: string;
	};
	rateLimit: {
		windowMs: number;
		maxRequests: number;
	};
}

function validateEnv(key: string, defaultValue?: string): string {
	const value = process.env[key] ?? defaultValue;
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

function loadConfig(): ServerConfig {
	const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
	const port = parseInt(process.env.PORT || "3000", 10);
	const sessionSecret = process.env.SESSION_SECRET;

	if (nodeEnv === "production") {
		if (!sessionSecret || sessionSecret === "your-secret-key") {
			throw new Error("SESSION_SECRET must be set to a secure value in production");
		}
	}

	return {
		port,
		nodeEnv,
		cors: {
			origin: process.env.CORS_ORIGIN || "http://localhost:5173",
			credentials: true
		},
		session: {
			secret: sessionSecret || "your-secret-key",
			maxAge: 24 * 60 * 60 * 1000 // 24 hours
		},
		mongodb: {
			uri: process.env.MONGODB_URI || "mongodb://localhost:27017/ircdb"
		},
		rateLimit: {
			windowMs: 15 * 60 * 1000, // 15 minutes
			maxRequests: 5
		}
	};
}

let cachedConfig: ServerConfig | null = null;

export function getConfig(): ServerConfig {
	if (!cachedConfig) {
		cachedConfig = loadConfig();
	}
	return cachedConfig;
}
