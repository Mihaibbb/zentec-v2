import { Router } from "express";
import bcrypt from "bcryptjs";
import { signToken, authRequired } from "../middleware/auth.js";
import { query } from "../db.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body as { email: string; password: string };
		if (!email || !password) return res.status(400).json({ error: "Missing credentials" });
		const [rows] = await query<any>("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
		const user = rows[0];
		if (!user) return res.status(401).json({ error: "Invalid credentials" });
		const ok = await bcrypt.compare(password, user.password);
		if (!ok) return res.status(401).json({ error: "Invalid credentials" });

		const token = signToken({
			id: user.id,
			email: user.email,
			role: user.role === "SUPER_ADMIN" ? "super-admin" : user.role === "ADMIN" ? "admin" : "doctor",
			clinicId: user.clinicId
		});
		return res.json({ token });
	} catch (error: any) {
		console.error("Error during login:", error);
		if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
			return res.status(503).json({ error: "Database connection timeout. Please try again." });
		}
		return res.status(500).json({ error: "Login failed" });
	}
});

authRouter.get("/me", authRequired, async (req, res) => {
	try {
		const userId = req.user!.id;
		const [rows] = await query<any>("SELECT id, email, firstName, lastName, role, clinicId FROM users WHERE id = ?", [userId]);
		if ((rows as any[]).length === 0) return res.status(404).json({ error: "Not found" });
		return res.json(rows[0]);
	} catch (error: any) {
		console.error("Error fetching user:", error);
		if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
			return res.status(503).json({ error: "Database connection timeout. Please try again." });
		}
		return res.status(500).json({ error: "Failed to fetch user" });
	}
});


