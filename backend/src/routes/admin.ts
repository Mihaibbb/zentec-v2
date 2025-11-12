import { Router } from "express";
import { authRequired, requireRoles } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import { query } from "../db.js";

export const adminRouter = Router();

// Super Admin: Clinics CRUD
adminRouter.use(authRequired, requireRoles(["super-admin"]));

adminRouter.get("/clinics", async (_req, res) => {
	const [rows] = await query<any>("SELECT * FROM clinics ORDER BY id ASC");
	return res.json(rows);
});

adminRouter.get("/clinics/:clinicId", async (req, res) => {
	const clinicId = Number(req.params.clinicId);
	const [rows] = await query<any>("SELECT * FROM clinics WHERE id = ?", [clinicId]);
	if ((rows as any[]).length === 0) return res.status(404).json({ error: "Not found" });
	return res.json(rows[0]);
});

adminRouter.post("/clinics", async (req, res) => {
	const { name, email, location } = req.body as { name: string; email: string; location?: string };
	const [result]: any = await query("INSERT INTO clinics (name,email,location) VALUES (?,?,?)", [name, email, location || null]);
	const [rows] = await query<any>("SELECT * FROM clinics WHERE id = ?", [result.insertId]);
	return res.status(201).json(rows[0]);
});

adminRouter.post("/clinics/:clinicId/users", async (req, res) => {
	const clinicId = Number(req.params.clinicId);
	const { email, password, firstName, lastName, role } = req.body as {
		email: string; password: string; firstName: string; lastName: string; role: "admin" | "doctor";
	};
	const passwordHash = await bcrypt.hash(password, 10);
	const [insertUser]: any = await query(
		"INSERT INTO users (email,password,firstName,lastName,role,clinicId) VALUES (?,?,?,?,?,?)",
		[email, passwordHash, firstName, lastName, role === "admin" ? "ADMIN" : "DOCTOR", clinicId]
	);
	if (role === "doctor") {
		await query("INSERT INTO doctors (userId, clinicId) VALUES (?,?)", [insertUser.insertId, clinicId]);
	}
	const [rows] = await query<any>("SELECT * FROM users WHERE id = ?", [insertUser.insertId]);
	return res.status(201).json(rows[0]);
});


