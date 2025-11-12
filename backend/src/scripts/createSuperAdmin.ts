import { query } from "../db.js";
import bcrypt from "bcryptjs";
import { env } from "../env.js";

function parseArgs() {
	const args = process.argv.slice(2);
	const out: Record<string, string> = {};
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a.startsWith("--")) {
			const key = a.replace(/^--/, "");
			const next = args[i + 1];
			if (next && !next.startsWith("--")) {
				out[key] = next;
				i++;
			} else {
				out[key] = "true";
			}
		}
	}
	return out as {
		email?: string;
		password?: string;
		first?: string;
		last?: string;
	};
}

async function main() {
	const { email, password, first, last } = parseArgs();
	if (!email || !password) {
		console.error("Usage: npm run create:super-admin -- --email you@domain.com --password yourPass [--first First] [--last Last]");
		process.exit(1);
	}
	const firstName = first || "Super";
	const lastName = last || "Admin";

	const [existing] = await query<any>("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
	if ((existing as any[]).length) {
		console.log(`User with email ${email} already exists. Updating role to SUPER_ADMIN...`);
		await query("UPDATE users SET role = 'SUPER_ADMIN' WHERE email = ?", [email]);
		console.log("Done.");
		process.exit(0);
	}

	const hash = await bcrypt.hash(password, 10);
	await query(
		"INSERT INTO users (email, password, firstName, lastName, role) VALUES (?,?,?,?, 'SUPER_ADMIN')",
		[email, hash, firstName, lastName]
	);
	console.log(`Super admin created: ${email}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});

