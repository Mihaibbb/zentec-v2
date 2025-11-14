import mysql from "mysql2/promise";
import { env } from "./env.js";

// Parse DATABASE_URL connection string
function parseDatabaseUrl(url: string): mysql.PoolOptions {
	if (!url) {
		throw new Error("DATABASE_URL is not set");
	}
	
	// Parse mysql://user:password@host:port/database format
	if (url.startsWith("mysql://")) {
		try {
			const parsed = new URL(url);
			const config: mysql.PoolOptions = {
				host: parsed.hostname,
				port: parsed.port ? parseInt(parsed.port) : 3306,
				user: decodeURIComponent(parsed.username),
				password: decodeURIComponent(parsed.password),
				database: decodeURIComponent(parsed.pathname.slice(1)), // Remove leading slash and decode
			};
			
			// Handle SSL for remote databases (like Railway)
			if (parsed.hostname && !parsed.hostname.includes("localhost") && !parsed.hostname.includes("127.0.0.1")) {
				config.ssl = { rejectUnauthorized: false };
			}
			
			return config;
		} catch (e: any) {
			console.error("Failed to parse DATABASE_URL:", e.message);
			throw new Error(`Invalid DATABASE_URL format: ${e.message}`);
		}
	}
	
	// Fallback: try to parse manually (for cases where URL parsing fails)
	const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
	if (match) {
		return {
			host: match[3],
			port: parseInt(match[4]),
			user: decodeURIComponent(match[1]),
			password: decodeURIComponent(match[2]),
			database: decodeURIComponent(match[5]),
			ssl: match[3] && !match[3].includes("localhost") ? { rejectUnauthorized: false } : undefined
		};
	}
	
	throw new Error(`Could not parse DATABASE_URL. Expected format: mysql://user:password@host:port/database`);
}

const dbConfig = parseDatabaseUrl(env.DATABASE_URL);

export const pool = mysql.createPool({
	...dbConfig,
	connectionLimit: 10,
	waitForConnections: true,
	queueLimit: 0,
	connectTimeout: 30000, // 30 seconds
	enableKeepAlive: true,
	keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
	.then(connection => {
		console.log("✅ Database connection established");
		connection.release();
	})
	.catch(err => {
		console.error("❌ Database connection failed:", err.message);
		if (err.code === "ETIMEDOUT") {
			console.error("   Connection timeout - check your DATABASE_URL and ensure MySQL server is running");
			console.error("   DATABASE_URL format: mysql://user:password@host:port/database");
		} else if (err.code === "ECONNREFUSED") {
			console.error("   Connection refused - ensure MySQL server is running and accessible");
		} else if (err.code === "ER_ACCESS_DENIED_ERROR") {
			console.error("   Access denied - check your database username and password");
		}
	});

export async function query<T = any>(sql: string, params?: any[]): Promise<[T[], any]> {
	try {
		return pool.query<any>(sql, params) as Promise<[T[], any]>;
	} catch (error: any) {
		if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
			console.error("Database query timeout:", error.message);
			throw new Error("Database connection timeout. Please try again.");
		}
		throw error;
	}
}

