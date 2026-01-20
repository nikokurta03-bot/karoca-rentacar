-- SQL: Update Suzuki Vitara vehicles with LOCAL image
-- Run this in Supabase SQL Editor

UPDATE vehicles 
SET image_url = '/vehicles/suzuki-vitara.png'
WHERE name LIKE '%Suzuki Vitara%';
