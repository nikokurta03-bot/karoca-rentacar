-- Karoca Rent A Car - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vehicles table
CREATE TABLE vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  price_per_day DECIMAL(10, 2) NOT NULL,
  seats INTEGER NOT NULL DEFAULT 5,
  transmission VARCHAR(20) NOT NULL DEFAULT 'Automatik',
  fuel_type VARCHAR(20) NOT NULL DEFAULT 'Benzin',
  features TEXT[] DEFAULT '{}',
  rating DECIMAL(2, 1) DEFAULT 5.0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  pickup_location VARCHAR(255) NOT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample vehicles
INSERT INTO vehicles (name, category, image_url, price_per_day, seats, transmission, fuel_type, features, rating) VALUES
  ('Mercedes C-Class', 'Premium', '🚗', 89.00, 5, 'Automatik', 'Benzin', ARRAY['GPS', 'Klima', 'Bluetooth'], 4.9),
  ('BMW X5', 'SUV', '🚙', 129.00, 7, 'Automatik', 'Dizel', ARRAY['GPS', 'Klima', 'Panorama krov'], 4.8),
  ('Audi A4', 'Business', '🚘', 79.00, 5, 'Automatik', 'Benzin', ARRAY['GPS', 'Koža', 'Grijana sjedala'], 4.9),
  ('Volkswagen Golf', 'Economy', '🚗', 45.00, 5, 'Manual', 'Benzin', ARRAY['Klima', 'Bluetooth', 'USB'], 4.7),
  ('Tesla Model 3', 'Electric', '⚡', 99.00, 5, 'Automatik', 'Električni', ARRAY['Autopilot', 'Premium audio', 'Full Self-Driving'], 5.0),
  ('Porsche 911', 'Luxury', '🏎️', 299.00, 2, 'Automatik', 'Benzin', ARRAY['Sport paket', 'Premium koža', 'BOSE audio'], 5.0);

-- Row Level Security (RLS) policies

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Vehicles: Anyone can read
CREATE POLICY "Vehicles are viewable by everyone" ON vehicles
  FOR SELECT USING (true);

-- Bookings: Anyone can insert (for reservations)
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Contact messages: Anyone can insert
CREATE POLICY "Anyone can send contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_available ON vehicles(available);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_pickup_date ON bookings(pickup_date);
