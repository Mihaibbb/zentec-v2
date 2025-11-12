# Medical Software App (Clinics + Scheduling)

This repository contains a full‑stack, multi‑tenant medical appointment application with:

- Backend: Node.js, Express, MySQL
- Frontend: React (Vite + TypeScript + Tailwind), React Router, React Big Calendar (drag & drop)

It supports two modules:

- Super Admin module: manage clinics and clinic users.
- Clinic module: dashboard, doctors, calendar, patients.

Roles:

- `super-admin` – manages clinics and users globally.
- `admin` – manages their own clinic (doctors, appointments, patients).
- `doctor` – sees only their own calendar.

## Quickstart

1) Create the environment files

Copy and edit the backend `.env`:

```
cp backend/.env.example backend/.env
```

2) Install dependencies

```
npm install
```

3) Prepare database (MySQL)

- Ensure MySQL is running and `DATABASE_URL` in `backend/.env` points to your server (e.g. `mysql://user:password@localhost:3306/medical_app`).
- Apply schema (uses mysql CLI): `npm run db:apply -w backend`
- Seed data: `npm run db:seed -w backend`

4) Run dev servers

```
npm run dev
```

Backend runs at `http://localhost:4000`, Frontend at `http://localhost:5173`.

## Default Credentials (seed)

- Super Admin: `super@admin.com` / `superadmin`
- Clinic Admin: `admin@clinic.com` / `admin123`
- Doctor: `doctor@clinic.com` / `doctor123`

## Notes

- Drag & drop is enabled within the calendar. Appointments cannot be moved into the past.
- Multi‑tenancy is enforced: every user belongs to a clinic (except super‑admin) via `clinicId`.

## Scripts

Root:

- `npm run dev` – run backend and frontend in watch mode
- `npm run build` – build backend and frontend

Backend workspace:

- `npm run dev` – run Express + ts-node-dev
- `npm run db:seed` – run seed data


