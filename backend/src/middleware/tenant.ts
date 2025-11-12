import { Request, Response, NextFunction } from "express";

// Ensures that a user is bound to a clinic for tenant-aware routes
export function requireClinicContext(req: Request, res: Response, next: NextFunction) {
	const clinicId = Number(req.headers["x-clinic-id"] || req.query.clinicId || req.user?.clinicId);
	if (!clinicId) return res.status(400).json({ error: "Missing clinic context" });
	// Super admins can pass any clinicId; admins/doctors must match their own
	if (req.user?.role !== "super-admin" && req.user?.clinicId !== clinicId) {
		return res.status(403).json({ error: "Forbidden clinic context" });
	}
	(req as any).clinicId = clinicId;
	next();
}

