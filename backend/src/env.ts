import dotenv from "dotenv";
dotenv.config();

export const env = {
	PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
	JWT_SECRET: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
	DATABASE_URL: process.env.DATABASE_URL || ""
};

if (!env.DATABASE_URL) {
	console.warn("DATABASE_URL is not set. Prisma will fail without it.");
}

