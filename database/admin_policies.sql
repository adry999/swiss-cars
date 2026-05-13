-- ==========================================
-- ADMIN SETUP & POLICIES
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Create Site Settings Table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial contact info if not present
INSERT INTO site_settings (key, value) 
VALUES ('contact_info', '{"phone": "+41 78 323 31 50", "email": "info@swisscars.md", "address": "Switzerland", "whatsapp": "+41783233150"}') 
ON CONFLICT (key) DO NOTHING;

-- 2. Cars Table Management Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Allow authenticated inserts on cars') THEN
        CREATE POLICY "Allow authenticated inserts on cars" ON cars FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Allow authenticated updates on cars') THEN
        CREATE POLICY "Allow authenticated updates on cars" ON cars FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Allow authenticated deletes on cars') THEN
        CREATE POLICY "Allow authenticated deletes on cars" ON cars FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 3. Car Images Table Management Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_images' AND policyname = 'Allow authenticated inserts on car_images') THEN
        CREATE POLICY "Allow authenticated inserts on car_images" ON car_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_images' AND policyname = 'Allow authenticated updates on car_images') THEN
        CREATE POLICY "Allow authenticated updates on car_images" ON car_images FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_images' AND policyname = 'Allow authenticated deletes on car_images') THEN
        CREATE POLICY "Allow authenticated deletes on car_images" ON car_images FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 4. Reviews Table Management Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Allow authenticated inserts on reviews') THEN
        CREATE POLICY "Allow authenticated inserts on reviews" ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Allow authenticated updates on reviews') THEN
        CREATE POLICY "Allow authenticated updates on reviews" ON reviews FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Allow authenticated deletes on reviews') THEN
        CREATE POLICY "Allow authenticated deletes on reviews" ON reviews FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 5. Partners Table Management Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Allow authenticated inserts on partners') THEN
        CREATE POLICY "Allow authenticated inserts on partners" ON partners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Allow authenticated updates on partners') THEN
        CREATE POLICY "Allow authenticated updates on partners" ON partners FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Allow authenticated deletes on partners') THEN
        CREATE POLICY "Allow authenticated deletes on partners" ON partners FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 6. Site Settings Management Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow public read on site_settings') THEN
        CREATE POLICY "Allow public read on site_settings" ON site_settings FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow authenticated updates on site_settings') THEN
        CREATE POLICY "Allow authenticated updates on site_settings" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;
