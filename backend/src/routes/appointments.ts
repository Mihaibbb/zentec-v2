import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { query } from "../db.js";

export const appointmentsRouter = Router();
appointmentsRouter.use(authRequired);

// List appointments by clinic and optional doctor
appointmentsRouter.get("/", async (req, res) => {
	try {
		const clinicId = Number(req.query.clinicId);
		const doctorId = req.query.doctorId ? Number(req.query.doctorId) : undefined;
		const start = req.query.start ? new Date(String(req.query.start)) : undefined;
		const end = req.query.end ? new Date(String(req.query.end)) : undefined;
		if (!clinicId) return res.status(400).json({ error: "clinicId required" });
		const params: any[] = [clinicId];
		let sql = "SELECT * FROM appointments WHERE clinicId = ?";
		if (doctorId) { sql += " AND doctorId = ?"; params.push(doctorId); }
		if (start && end) { sql += " AND start >= ? AND end <= ?"; params.push(start, end); }
		const [rows] = await query<any>(sql, params);
		return res.json(rows);
	} catch (error: any) {
		console.error("Error fetching appointments:", error);
		if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
			return res.status(503).json({ error: "Database connection timeout. Please try again." });
		}
		return res.status(500).json({ error: "Failed to fetch appointments" });
	}
});

appointmentsRouter.post("/", async (req, res) => {
	try {
		const { clinicId, doctorId, patientId, title, start, end, cost, notes } = req.body as any;
		if (!clinicId || !doctorId || !title || !start || !end) {
			return res.status(400).json({ error: "clinicId, doctorId, title, start, and end are required" });
		}
		const [result]: any = await query(
			`INSERT INTO appointments (clinicId,doctorId,patientId,title,start,end,cost,notes)
			 VALUES (?,?,?,?,?,?,?,?)`,
			[Number(clinicId), Number(doctorId), patientId ? Number(patientId) : null, title, new Date(start), new Date(end), Number(cost || 0), notes || null]
		);
		const [rows] = await query<any>("SELECT * FROM appointments WHERE id = ?", [result.insertId]);
		return res.status(201).json(rows[0]);
	} catch (error: any) {
		console.error("Error creating appointment:", error);
		if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
			return res.status(503).json({ error: "Database connection timeout. Please try again." });
		}
		return res.status(500).json({ error: "Failed to create appointment" });
	}
});

// Update appointment times or reassign doctor; block past edits
appointmentsRouter.patch("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (!id || isNaN(id)) {
			return res.status(400).json({ error: "Invalid appointment ID" });
		}
		const { start, end, doctorId, title, cost, notes } = req.body as any;
		// Prevent editing appointments that ended in the past
		const [rows] = await query<any>("SELECT * FROM appointments WHERE id = ?", [id]);
		const appt = rows[0];
		if (!appt) return res.status(404).json({ error: "Not found" });
		if (new Date(appt.end) < new Date()) return res.status(400).json({ error: "Cannot edit past appointment" });
		const fields: string[] = [];
		const params: any[] = [];
		if (start) { fields.push("start = ?"); params.push(new Date(start)); }
		if (end) { fields.push("end = ?"); params.push(new Date(end)); }
		if (doctorId) { fields.push("doctorId = ?"); params.push(Number(doctorId)); }
		if (title !== undefined) { fields.push("title = ?"); params.push(title); }
		if (cost !== undefined) { fields.push("cost = ?"); params.push(Number(cost)); }
		if (notes !== undefined) { fields.push("notes = ?"); params.push(notes); }
		if (fields.length === 0) return res.json(appt);
		params.push(id);
		await query(`UPDATE appointments SET ${fields.join(", ")} WHERE id = ?`, params);
		const [rows2] = await query<any>("SELECT * FROM appointments WHERE id = ?", [id]);
		return res.json(rows2[0]);
	} catch (error: any) {
		console.error("Error updating appointment:", error);
		if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
			return res.status(503).json({ error: "Database connection timeout. Please try again." });
		}
		return res.status(500).json({ error: "Failed to update appointment" });
	}
});

appointmentsRouter.delete("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (!id || isNaN(id)) {
			return res.status(400).json({ error: "Invalid appointment ID" });
		}
		const [rows] = await query<any>("SELECT id FROM appointments WHERE id = ?", [id]);
		if ((rows as any[]).length === 0) return res.status(404).json({ error: "Not found" });
		await query("DELETE FROM appointments WHERE id = ?", [id]);
		return res.json({ ok: true });
	} catch (error: any) {
		console.error("Error deleting appointment:", error);
		if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
			return res.status(503).json({ error: "Database connection timeout. Please try again." });
		}
		return res.status(500).json({ error: "Failed to delete appointment" });
	}
});


