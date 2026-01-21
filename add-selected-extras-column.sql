-- Add selected_extras column to store the list of IDs
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS selected_extras TEXT[] DEFAULT '{}';
