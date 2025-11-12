import mysql from "mysql2/promise";
import { env } from "./env.js";

export const pool = mysql.createPool({
	uri: env.DATABASE_URL,
	connectionLimit: 10,
	waitForConnections: true
});

export async function query<T = any>(sql: string, params?: any[]): Promise<[T[], any]> {
	return pool.query(sql, params);
}

