/**
 * Route Index
 * 
 * This file documents all available API routes and their access requirements.
 * Import this file if you need to reference route paths in code.
 */

/**
 * Authentication Routes
 * Base path: /auth
 * All routes are public (no authentication required)
 */
export const AUTH_ROUTES = {
	LOGIN: '/auth/login',     // POST - Authenticate user
	LOGOUT: '/auth/logout'    // POST - Destroy session
} as const;

/**
 * Province Routes
 * Base path: /provinces
 * Access: Global Admin only
 */
export const PROVINCE_ROUTES = {
	LIST: '/provinces',                    // GET - List all provinces
	DETAIL: '/provinces/:provinceId'       // GET - Get specific province
} as const;

/**
 * Employee Routes
 * Base path: /provinces/:provinceId/employees
 * Access: Global Admin (all provinces) | Province Admin (own province only)
 */
export const EMPLOYEE_ROUTES = {
	LIST: '/provinces/:provinceId/employees',                      // GET - List employees (paginated)
	CREATE: '/provinces/:provinceId/employees',                    // POST - Create new employee
	DETAIL: '/provinces/:provinceId/employees/:employeeId',        // GET - Get single employee
	UPDATE: '/provinces/:provinceId/employees/:employeeId',        // PUT - Update employee
	DELETE: '/provinces/:provinceId/employees/:employeeId'         // DELETE - Delete employee
} as const;

/**
 * API Documentation Routes
 * Base path: /api-docs
 * All routes are public
 */
export const API_DOCS_ROUTES = {
	HOME: '/api-docs',           // GET - API documentation home (ReDoc)
	JSON: '/api-docs/json',      // GET - OpenAPI/Swagger JSON spec
	SWAGGER: '/api-docs/swagger' // GET - Swagger UI
} as const;

/**
 * Admin Dashboard Routes
 * Base path: /admin-dashboard
 * Access: Global Admin only
 */
export const ADMIN_DASHBOARD_ROUTES = {
	STATS: '/admin-dashboard/stats'  // GET - Fetch dashboard statistics
} as const;

/**
 * System Routes
 */
export const SYSTEM_ROUTES = {
	HEALTH: '/health'  // GET - Health check endpoint
} as const;

/**
 * All routes grouped by category
 */
export const ROUTES = {
	AUTH: AUTH_ROUTES,
	PROVINCES: PROVINCE_ROUTES,
	EMPLOYEES: EMPLOYEE_ROUTES,
	ADMIN_DASHBOARD: ADMIN_DASHBOARD_ROUTES,
	API_DOCS: API_DOCS_ROUTES,
	SYSTEM: SYSTEM_ROUTES
} as const;

/**
 * Route Access Control Matrix
 * 
 * | Route                                    | Global Admin | Province Admin | Public |
 * |------------------------------------------|--------------|----------------|--------|
 * | POST   /auth/login                       | ✓            | ✓              | ✓      |
 * | POST   /auth/logout                      | ✓            | ✓              | ✓      |
 * | GET    /provinces                        | ✓            | ✗              | ✗      |
 * | GET    /provinces/:id                    | ✓            | ✗              | ✗      |
 * | GET    /provinces/:id/employees          | ✓            | ✓ (own)        | ✗      |
 * | POST   /provinces/:id/employees          | ✓            | ✓ (own)        | ✗      |
 * | GET    /provinces/:id/employees/:empId   | ✓            | ✓ (own)        | ✗      |
 * | PUT    /provinces/:id/employees/:empId   | ✓            | ✓ (own)        | ✗      |
 * | DELETE /provinces/:id/employees/:empId   | ✓            | ✓ (own)        | ✗      |
 * | GET    /admin-dashboard/stats            | ✓            | ✗              | ✗      |
 * | GET    /api-docs                         | ✓            | ✓              | ✓      |
 * | GET    /health                           | ✓            | ✓              | ✓      |
 */
