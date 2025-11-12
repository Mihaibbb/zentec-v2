export type AppRole = "super-admin" | "admin" | "doctor";

export const RoleMap = {
	"super-admin": "SUPER_ADMIN",
	"admin": "ADMIN",
	"doctor": "DOCTOR"
} as const;

export function isAtLeastAdmin(role: AppRole) {
	return role === "super-admin" || role === "admin";
}

export function isSuperAdmin(role: AppRole) {
	return role === "super-admin";
}

