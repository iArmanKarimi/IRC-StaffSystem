const ENDPOINTS = {
	// GET
	ROOT: "/",
	// POST
	LOGIN: "/auth/login",
	LOGOUT: "/auth/logout",
	// POST, GET
	EMPLOYEES_GLOBAL: "/employees/",
	// GET
	EMPLOYEES_PROVINCE: "/employees/my-province",
	// PUT, DELETE, GET
	EMPLOYEES_GET_ONE: "/employees/:id",
} as const;

export default ENDPOINTS;
