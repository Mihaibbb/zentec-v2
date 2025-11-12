import { Router } from "express";
import { authRequired, requireRoles } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import { query } from "../db.js";

export const clinicRouter = Router();

// Get current user's clinic
clinicRouter.get("/me", authRequired, async (req, res) => {
	const user = req.user!;
	if (!user.clinicId) return res.status(404).json({ error: "No clinic associated" });
	const [rows] = await query<any>("SELECT * FROM clinics WHERE id = ?", [user.clinicId]);
	if ((rows as any[]).length === 0) return res.status(404).json({ error: "Not found" });
	return res.json(rows[0]);
});

clinicRouter.use(authRequired, requireRoles(["admin", "super-admin"]));

// Get clinic users
clinicRouter.get("/:clinicId/users", async (req, res) => {
	const clinicId = Number(req.params.clinicId);
	const [users] = await query<any>("SELECT * FROM users WHERE clinicId = ? ORDER BY id ASC", [clinicId]);
	return res.json(users);
});

// Add clinic user
clinicRouter.post("/:clinicId/users", async (req, res) => {
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


