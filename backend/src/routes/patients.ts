import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { query } from "../db.js";

export const patientsRouter = Router();
patientsRouter.use(authRequired);

patientsRouter.get("/", async (req, res) => {
	const clinicId = Number(req.query.clinicId);
	if (!clinicId) return res.status(400).json({ error: "clinicId required" });
	const [rows] = await query<any>("SELECT * FROM patients WHERE clinicId = ? ORDER BY id ASC", [clinicId]);
	return res.json(rows);
});

patientsRouter.post("/", async (req, res) => {
	const {
		clinicId, firstName, lastName, phone, notes,
		email, country, city, address, gender, pic, fileNumber, dob
	} = req.body as any;
	const [result]: any = await query(
		`INSERT INTO patients
		 (clinicId, firstName, lastName, phone, notes, email, country, city, address, gender, pic, fileNumber, dob)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		[
			Number(clinicId), firstName, lastName, phone || null, notes || null,
			email || null, country || null, city || null, address || null,
			gender || null, pic || null, fileNumber ? Number(fileNumber) : null,
			dob ? new Date(dob) : null
		]
	);
	const [rows] = await query<any>("SELECT * FROM patients WHERE id = ?", [result.insertId]);
	return res.status(201).json(rows[0]);
});

patientsRouter.get("/:id", async (req, res) => {
	const id = Number(req.params.id);
	const [rows] = await query<any>("SELECT * FROM patients WHERE id = ?", [id]);
	if ((rows as any[]).length === 0) return res.status(404).json({ error: "Not found" });
	return res.json(rows[0]);
});

patientsRouter.patch("/:id", async (req, res) => {
	const id = Number(req.params.id);
	const {
		firstName, lastName, phone, notes,
		email, country, city, address, gender, pic, fileNumber, dob
	} = req.body as any;
	
	const updates: string[] = [];
	const values: any[] = [];
	
	if (firstName !== undefined) { updates.push("firstName = ?"); values.push(firstName); }
	if (lastName !== undefined) { updates.push("lastName = ?"); values.push(lastName); }
	if (phone !== undefined) { updates.push("phone = ?"); values.push(phone || null); }
	if (notes !== undefined) { updates.push("notes = ?"); values.push(notes || null); }
	if (email !== undefined) { updates.push("email = ?"); values.push(email || null); }
	if (country !== undefined) { updates.push("country = ?"); values.push(country || null); }
	if (city !== undefined) { updates.push("city = ?"); values.push(city || null); }
	if (address !== undefined) { updates.push("address = ?"); values.push(address || null); }
	if (gender !== undefined) { updates.push("gender = ?"); values.push(gender || null); }
	if (pic !== undefined) { updates.push("pic = ?"); values.push(pic || null); }
	if (fileNumber !== undefined) { updates.push("fileNumber = ?"); values.push(fileNumber ? Number(fileNumber) : null); }
	if (dob !== undefined) { updates.push("dob = ?"); values.push(dob ? new Date(dob) : null); }
	
	values.push(id);
	await query(`UPDATE patients SET ${updates.join(", ")} WHERE id = ?`, values);
	
	const [rows] = await query<any>("SELECT * FROM patients WHERE id = ?", [id]);
	return res.json(rows[0]);
});

patientsRouter.delete("/:id", async (req, res) => {
	const id = Number(req.params.id);
	await query("DELETE FROM patients WHERE id = ?", [id]);
	return res.json({ ok: true });
});


