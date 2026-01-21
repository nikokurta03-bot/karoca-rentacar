-- Promo Codes Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  discount_percent INT NOT NULL CHECK (discount_percent IN (10, 20, 30, 40, 50, 60)),
  active BOOLEAN DEFAULT true,
  uses_remaining INT DEFAULT NULL,
  valid_until DATE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read and manage promo codes
CREATE POLICY "Authenticated users can manage promo codes" ON promo_codes
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow anonymous users to read active promo codes (for validation)
CREATE POLICY "Anyone can read active promo codes" ON promo_codes
  FOR SELECT USING (active = true);

-- Insert some test promo codes
INSERT INTO promo_codes (code, discount_percent, active) VALUES
  ('KAROCA10', 10, true),
  ('SUMMER20', 20, true),
  ('VIP50', 50, false);
