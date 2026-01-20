-- SQL Migration: Add license plate field
-- Run this in Supabase SQL Editor

-- Add license plate column
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS license_plate TEXT;

-- Update existing vehicles with random Croatian plates
UPDATE vehicles SET license_plate = 'ZD-' || LPAD(FLOOR(RANDOM() * 999 + 1)::TEXT, 3, '0') || '-' || CHR(65 + FLOOR(RANDOM() * 26)::INT) || CHR(65 + FLOOR(RANDOM() * 26)::INT)
WHERE license_plate IS NULL;
