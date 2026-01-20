-- SQL Migration: Add vehicle management fields
-- Run this in Supabase SQL Editor

-- Add new columns to vehicles table
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS registration_expiry DATE,
ADD COLUMN IF NOT EXISTS kasko_expiry DATE,
ADD COLUMN IF NOT EXISTS last_service_date DATE,
ADD COLUMN IF NOT EXISTS tire_type TEXT DEFAULT 'Ljetne' CHECK (tire_type IN ('Ljetne', 'Zimske')),
ADD COLUMN IF NOT EXISTS tire_age INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'Bijela',
ADD COLUMN IF NOT EXISTS cleanliness TEXT DEFAULT 'Oprano' CHECK (cleanliness IN ('Oprano', 'Neoprano')),
ADD COLUMN IF NOT EXISTS vehicle_status TEXT DEFAULT 'Spreman' CHECK (vehicle_status IN ('Spreman', 'U najmu', 'Servis'));

-- Update existing vehicles with default values
UPDATE vehicles SET
  mileage = 0,
  registration_expiry = CURRENT_DATE + INTERVAL '1 year',
  kasko_expiry = CURRENT_DATE + INTERVAL '1 year',
  last_service_date = CURRENT_DATE,
  tire_type = 'Ljetne',
  tire_age = 0,
  color = 'Bijela',
  cleanliness = 'Oprano',
  vehicle_status = 'Spreman'
WHERE mileage IS NULL;
