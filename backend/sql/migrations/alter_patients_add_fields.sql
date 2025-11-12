-- Migration to extend patients table with additional fields (idempotent for MySQL 8+)
USE medical_app;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS email VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS country VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS city VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS address VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS gender ENUM('M','F','N') NULL,
  ADD COLUMN IF NOT EXISTS pic VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS fileNumber INT NULL,
  ADD COLUMN IF NOT EXISTS dob DATE NULL;

-- No password column is added for patients (patients do not have login credentials).

