// User role types and constants
export const USER_ROLE = {
	GLOBAL_ADMIN: "globalAdmin",
	PROVINCE_ADMIN: "provinceAdmin"
} as const;
export type UserRoleType = typeof USER_ROLE[keyof typeof USER_ROLE];
