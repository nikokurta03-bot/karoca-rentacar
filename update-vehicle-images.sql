-- SQL: Update Suzuki Vitara vehicles with real image
-- Run this in Supabase SQL Editor

UPDATE vehicles 
SET image_url = 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop'
WHERE name LIKE '%Suzuki Vitara%';

-- Alternative: Use specific image per vehicle
-- UPDATE vehicles SET image_url = 'YOUR_IMAGE_URL' WHERE id = 'vehicle_id';
