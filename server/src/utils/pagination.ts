import { Request } from "express";

export interface PaginationParams {
	page: number;
	limit: number;
	skip: number;
}

/**
 * Parses and validates pagination query parameters
 * @param req Express request
 * @param defaultLimit Default items per page (default: 20)
 * @param maxLimit Maximum items per page (default: 100)
 * @returns Pagination parameters
 */
export function getPaginationParams(
	req: Request,
	defaultLimit: number = 20,
	maxLimit: number = 100
): PaginationParams {
	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	let limit = parseInt(req.query.limit as string) || defaultLimit;

	// Enforce maximum limit to prevent abuse
	if (limit > maxLimit) {
		limit = maxLimit;
	}

	// Enforce minimum limit
	if (limit < 1) {
		limit = 1;
	}

	const skip = (page - 1) * limit;

	return { page, limit, skip };
}

/**
 * Builds HATEOAS links for pagination
 * @param path Base path for links
 * @param page Current page
 * @param limit Items per page
 * @param totalPages Total number of pages
 * @returns Links object
 */
export function buildPaginationLinks(
	path: string,
	page: number,
	limit: number,
	totalPages: number
): Record<string, string> {
	const links: Record<string, string> = {
		self: `${path}?page=${page}&limit=${limit}`,
		first: `${path}?page=1&limit=${limit}`
	};

	if (page > 1) {
		links.prev = `${path}?page=${page - 1}&limit=${limit}`;
	}

	if (page < totalPages) {
		links.next = `${path}?page=${page + 1}&limit=${limit}`;
	}

	links.last = `${path}?page=${totalPages}&limit=${limit}`;

	return links;
}
