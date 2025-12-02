import rateLimit from "express-rate-limit";

// Rate limiter for authentication routes to prevent brute force attacks
export const authRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per windowMs
	message: "Too many login attempts, please try again later",
	standardHeaders: true,
	legacyHeaders: false,
});

