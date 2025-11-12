-- Migration to extend patients table with additional fields (idempotent for MySQL 8+)
USE medical_app;

ALTER TABLE patients
  ADD COLUMN country VARCHAR(191) NULL,
  ADD COLUMN city VARCHAR(191) NULL,
  ADD COLUMN address VARCHAR(191) NULL,
  ADD COLUMN gender ENUM('M','F','N') NULL,
  ADD COLUMN pic VARCHAR(64) NULL,
  ADD COLUMN fileNumber INT NULL,
  ADD COLUMN dob DATE NULL;

-- No password column is added for patients (patients do not have login credentials).

