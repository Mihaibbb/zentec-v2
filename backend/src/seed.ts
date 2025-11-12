import bcrypt from "bcryptjs";
import { query } from "./db.js";

async function main() {
	// Super Admin
	const superEmail = "super@admin.com";
	const superPass = await bcrypt.hash("superadmin", 10);
	const [sRows] = await query<any>("SELECT id FROM users WHERE email = ?", [superEmail]);
	if (!(sRows as any[])[0]) {
		await query("INSERT INTO users (email,password,firstName,lastName,role) VALUES (?,?,?,?,?)",
			[superEmail, superPass, "Super", "Admin", "SUPER_ADMIN"]);
	}

	// Clinic
	const [cRows] = await query<any>("SELECT * FROM clinics WHERE email = ?", ["clinic@demo.com"]);
	let clinic = (cRows as any[])[0];
	if (!clinic) {
		const [res]: any = await query("INSERT INTO clinics (name,email,location) VALUES (?,?,?)", ["Demo Clinic", "clinic@demo.com", "Bucharest"]);
		const [c2] = await query<any>("SELECT * FROM clinics WHERE id = ?", [res.insertId]);
		clinic = (c2 as any[])[0];
	}

	// Admin
	const adminEmail = "admin@clinic.com";
	const adminPass = await bcrypt.hash("admin123", 10);
	const [aRows] = await query<any>("SELECT * FROM users WHERE email = ?", [adminEmail]);
	if (!(aRows as any[])[0]) {
		await query("INSERT INTO users (email,password,firstName,lastName,role,clinicId) VALUES (?,?,?,?,?,?)",
			[adminEmail, adminPass, "Clinic", "Admin", "ADMIN", clinic.id]);
	}

	// Doctor
	const doctorEmail = "doctor@clinic.com";
	const doctorPass = await bcrypt.hash("doctor123", 10);
	const [duRows] = await query<any>("SELECT * FROM users WHERE email = ?", [doctorEmail]);
	let doctorUser = (duRows as any[])[0];
	if (!doctorUser) {
		const [res]: any = await query("INSERT INTO users (email,password,firstName,lastName,role,clinicId) VALUES (?,?,?,?,?,?)",
			[doctorEmail, doctorPass, "Doctor", "Demo", "DOCTOR", clinic.id]);
		const [u2] = await query<any>("SELECT * FROM users WHERE id = ?", [res.insertId]);
		doctorUser = (u2 as any[])[0];
	}
	const [docRows] = await query<any>("SELECT * FROM doctors WHERE userId = ?", [doctorUser.id]);
	let doctor = (docRows as any[])[0];
	if (!doctor) {
		const [res]: any = await query("INSERT INTO doctors (userId, clinicId, color) VALUES (?,?,?)",
			[doctorUser.id, clinic.id, "#F59E0B"]);
		const [d2] = await query<any>("SELECT * FROM doctors WHERE id = ?", [res.insertId]);
		doctor = (d2 as any[])[0];
	}

	// Patient
	const [pRows] = await query<any>("SELECT * FROM patients WHERE clinicId = ? LIMIT 1", [clinic.id]);
	let patient = (pRows as any[])[0];
	if (!patient) {
		const [res]: any = await query("INSERT INTO patients (clinicId, firstName, lastName, phone) VALUES (?,?,?,?)",
			[clinic.id, "Pacient", "1", "0712345678"]);
		const [pp] = await query<any>("SELECT * FROM patients WHERE id = ?", [res.insertId]);
		patient = (pp as any[])[0];
	}

	// Sample appointment today 10:30 - 11:30
	const base = new Date();
	const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 10, 30, 0);
	const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 11, 30, 0);
	await query(
		"INSERT INTO appointments (clinicId, doctorId, patientId, title, start, end, cost) VALUES (?,?,?,?,?,?,?)",
		[clinic.id, doctor.id, patient.id, "Consultatie", start, end, 123]
	);

	console.log("Seed completed");
}

main().finally(() => process.exit(0));


