-- ==========================================
-- FULL PUBLIC ACCESS POLICIES (DEVELOPMENT MODE ONLY)
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Drop existing authenticated policies
DROP POLICY IF EXISTS "Allow authenticated inserts on cars" ON cars;
DROP POLICY IF EXISTS "Allow authenticated updates on cars" ON cars;
DROP POLICY IF EXISTS "Allow authenticated deletes on cars" ON cars;

DROP POLICY IF EXISTS "Allow authenticated inserts on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow authenticated updates on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow authenticated deletes on car_images" ON car_images;

DROP POLICY IF EXISTS "Allow authenticated inserts on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated updates on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated deletes on reviews" ON reviews;

DROP POLICY IF EXISTS "Allow authenticated inserts on partners" ON partners;
DROP POLICY IF EXISTS "Allow authenticated updates on partners" ON partners;
DROP POLICY IF EXISTS "Allow authenticated deletes on partners" ON partners;

DROP POLICY IF EXISTS "Allow authenticated updates on site_settings" ON site_settings;

-- 2. Create PUBLIC policies for all actions (WARNING: Anyone can edit the database)
-- Cars Table
DROP POLICY IF EXISTS "Allow public inserts on cars" ON cars;
DROP POLICY IF EXISTS "Allow public updates on cars" ON cars;
DROP POLICY IF EXISTS "Allow public deletes on cars" ON cars;

CREATE POLICY "Allow public inserts on cars" ON cars FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public updates on cars" ON cars FOR UPDATE USING (true);
CREATE POLICY "Allow public deletes on cars" ON cars FOR DELETE USING (true);

-- Car Images Table
DROP POLICY IF EXISTS "Allow public inserts on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow public updates on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow public deletes on car_images" ON car_images;

CREATE POLICY "Allow public inserts on car_images" ON car_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public updates on car_images" ON car_images FOR UPDATE USING (true);
CREATE POLICY "Allow public deletes on car_images" ON car_images FOR DELETE USING (true);

-- Reviews Table
DROP POLICY IF EXISTS "Allow public inserts on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public updates on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public deletes on reviews" ON reviews;

CREATE POLICY "Allow public inserts on reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public updates on reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Allow public deletes on reviews" ON reviews FOR DELETE USING (true);

-- Partners Table
DROP POLICY IF EXISTS "Allow public inserts on partners" ON partners;
DROP POLICY IF EXISTS "Allow public updates on partners" ON partners;
DROP POLICY IF EXISTS "Allow public deletes on partners" ON partners;

CREATE POLICY "Allow public inserts on partners" ON partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public updates on partners" ON partners FOR UPDATE USING (true);
CREATE POLICY "Allow public deletes on partners" ON partners FOR DELETE USING (true);

-- Site Settings Table
DROP POLICY IF EXISTS "Allow public inserts on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public updates on site_settings" ON site_settings;

CREATE POLICY "Allow public inserts on site_settings" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public updates on site_settings" ON site_settings FOR UPDATE USING (true);
