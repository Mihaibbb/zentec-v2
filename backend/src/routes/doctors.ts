import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { query } from "../db.js";

export const doctorsRouter = Router();
doctorsRouter.use(authRequired);

// List doctors for a clinic
doctorsRouter.get("/", async (req, res) => {
	const clinicId = Number(req.query.clinicId);
	if (!clinicId) return res.status(400).json({ error: "clinicId required" });
	const [rows] = await query<any>(
		`SELECT d.id, d.userId, u.firstName, u.lastName, u.email, d.color
		 FROM doctors d
		 JOIN users u ON u.id = d.userId
		 WHERE d.clinicId = ?
		 ORDER BY d.id ASC`,
		[clinicId]
	);
	return res.json((rows as any[]).map(d => ({
		id: d.id,
		userId: d.userId,
		name: `${d.firstName} ${d.lastName}`,
		email: d.email,
		color: d.color
	})));
});

// Get single doctor
doctorsRouter.get("/:doctorId", async (req, res) => {
	const doctorId = Number(req.params.doctorId);
	const [rows] = await query<any>(
		`SELECT d.id, d.userId, u.firstName, u.lastName, u.email, d.color
		 FROM doctors d
		 JOIN users u ON u.id = d.userId
		 WHERE d.id = ?`,
		[doctorId]
	);
	if ((rows as any[]).length === 0) return res.status(404).json({ error: "Not found" });
	const d = (rows as any[])[0];
	return res.json({
		id: d.id,
		userId: d.userId,
		firstName: d.firstName,
		lastName: d.lastName,
		email: d.email,
		color: d.color
	});
});

// Update doctor
doctorsRouter.patch("/:doctorId", async (req, res) => {
	const doctorId = Number(req.params.doctorId);
	const { firstName, lastName, email, color } = req.body as { firstName?: string; lastName?: string; email?: string; color?: string };
	
	// Get doctor's userId
	const [docRows] = await query<any>("SELECT userId FROM doctors WHERE id = ?", [doctorId]);
	if ((docRows as any[]).length === 0) return res.status(404).json({ error: "Not found" });
	const userId = (docRows as any[])[0].userId;
	
	// Update user if fields provided
	if (firstName || lastName || email) {
		const updates: string[] = [];
		const values: any[] = [];
		if (firstName) { updates.push("firstName = ?"); values.push(firstName); }
		if (lastName) { updates.push("lastName = ?"); values.push(lastName); }
		if (email) { updates.push("email = ?"); values.push(email); }
		values.push(userId);
		await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
	}
	
	// Update doctor color if provided
	if (color) {
		await query("UPDATE doctors SET color = ? WHERE id = ?", [color, doctorId]);
	}
	
	// Return updated doctor
	const [rows] = await query<any>(
		`SELECT d.id, d.userId, u.firstName, u.lastName, u.email, d.color
		 FROM doctors d
		 JOIN users u ON u.id = d.userId
		 WHERE d.id = ?`,
		[doctorId]
	);
	return res.json({
		id: rows[0].id,
		userId: rows[0].userId,
		firstName: rows[0].firstName,
		lastName: rows[0].lastName,
		email: rows[0].email,
		color: rows[0].color
	});
});

// Delete doctor: remove doctor row and its user
doctorsRouter.delete("/:doctorId", async (req, res) => {
	const doctorId = Number(req.params.doctorId);
	const [rows] = await query<any>("SELECT userId FROM doctors WHERE id = ?", [doctorId]);
	const doc = (rows as any[])[0];
	if (!doc) return res.status(404).json({ error: "Not found" });
	await query("DELETE FROM doctors WHERE id = ?", [doctorId]);
	await query("DELETE FROM users WHERE id = ?", [doc.userId]);
	return res.json({ ok: true });
});


