-- Update bookings table with new fields
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS extra_notes TEXT,
ADD COLUMN IF NOT EXISTS border_crossing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cleaning_fee BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT false;

-- Note: Total price calculation in the app will include these extras, 
-- but having flags helps the admin see what was selected.
