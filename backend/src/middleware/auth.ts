import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import { AppRole } from "../utils/roles.js";

export interface AuthUser {
	id: number;
	role: AppRole;
	clinicId?: number | null;
	email: string;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}

export function signToken(user: AuthUser) {
	return jwt.sign(user, env.JWT_SECRET, { expiresIn: "7d" });
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
	const header = req.headers.authorization;
	if (!header) return res.status(401).json({ error: "Missing Authorization" });
	const token = header.replace("Bearer ", "");
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
		req.user = decoded;
		next();
	} catch {
		return res.status(401).json({ error: "Invalid token" });
	}
}

export function requireRoles(roles: AppRole[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ error: "Forbidden" });
		}
		next();
	};
}

