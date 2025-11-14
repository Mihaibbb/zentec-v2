import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { clinicRouter } from "./routes/clinic.js";
import { appointmentsRouter } from "./routes/appointments.js";
import { doctorsRouter } from "./routes/doctors.js";
import { patientsRouter } from "./routes/patients.js";

const app = express();

// CORS configuration
const allowedOrigins = env.CORS_ORIGIN.split(",").map(origin => origin.trim());
app.use(cors({
	origin: (origin, callback) => {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		// Check if origin is in allowed list
		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			// In development, allow localhost origins
			if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "x-clinic-id"]
}));

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Auth
app.use("/api/auth", authRouter);

// Super Admin module
app.use("/api/admin", adminRouter);

// Clinic Admin module
app.use("/api/clinic", clinicRouter);

// Common module routes
app.use("/api/appointments", appointmentsRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/patients", patientsRouter);

app.listen(env.PORT, () => {
	console.log(`Backend listening on http://localhost:${env.PORT}`);
});


