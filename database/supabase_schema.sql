-- ==========================================
-- SWISS CARS DATABASE SCHEMA
-- ==========================================

-- 1. CARS TABLE
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  price NUMERIC NOT NULL,
  mileage INT,
  fuel_type TEXT,
  transmission TEXT,
  engine_cc INT,
  color_exterior TEXT,
  color_interior TEXT,
  body_type TEXT,
  drive TEXT,
  seats INT,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  description JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CAR IMAGES TABLE
CREATE TABLE IF NOT EXISTS car_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content_ro TEXT,
  content_ru TEXT,
  content_en TEXT,
  rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PARTNERS TABLE
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  logo_url TEXT,
  website_url TEXT,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS POLICIES (Enable Read access for everyone)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access on cars" ON cars FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on car_images" ON car_images FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on reviews" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Allow public read-only access on partners" ON partners FOR SELECT USING (is_visible = true);

-- ==========================================
-- SEED DATA (The 6 initial cars)
-- ==========================================

INSERT INTO cars (slug, brand, model, year, price, mileage, fuel_type, transmission, engine_cc, color_exterior, body_type, drive, seats, is_featured)
VALUES 
('audi-a6-allroad-2016-3-diesel', 'Audi', 'A6 Allroad', 2016, 33900, 179000, 'diesel', 'automatic', 3000, 'White', 'Universal', '4x4', 5, true),
('audi-a6-2017-2-diesel-s-line', 'Audi', 'A6 S-line', 2017, 25800, 147000, 'diesel', 'automatic', 2000, 'Black', 'Sedan', 'fwd', 5, true),
('mercedes-c-class-2015', 'Mercedes', 'Clasa C', 2015, 19500, 162400, 'diesel', 'automatic', 2200, 'Silver', 'Sedan', 'rwd', 5, false),
('fiat-500-2008', 'Fiat', '500', 2008, 5800, 80000, 'petrol', 'automatic', 1400, 'White', 'Hatchback', 'fwd', 4, false),
('volvo-xc60-2014', 'Volvo', 'XC60', 2014, 19999, 148680, 'diesel', 'automatic', 2400, 'Black', 'SUV', '4x4', 5, false),
('mercedes-sprinter-319-2013', 'Mercedes', 'Sprinter 319', 2013, 29999, 242680, 'diesel', 'manual', page-module__rI910a__actionBtn, 'White', 'Van', 'rwd', 9, false);

-- Note: Images URLs should be updated after uploading to Supabase Storage.

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES ('contact_info', '{"phone": "+41 78 323 31 50", "email": "info@swisscars.md", "address": "Switzerland", "whatsapp": "+41783233150"}') ON CONFLICT (key) DO NOTHING;

-- Storage Bucket Setup (Requires 'storage' schema access, usually works in Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public) VALUES ('car-images', 'car-images', true) ON CONFLICT (id) DO NOTHING;

-- Allow public access to images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'car-images');

-- Allow authenticated uploads (if they are logged in) or just everything for testing (dangerous but good for initial setup)
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-images');

-- 6. ADMIN WRITABLE POLICIES (Allow all actions for authenticated users)

-- Cars Table
CREATE POLICY "Allow authenticated inserts on cars" ON cars FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated updates on cars" ON cars FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated deletes on cars" ON cars FOR DELETE USING (auth.role() = 'authenticated');

-- Car Images Table
CREATE POLICY "Allow authenticated inserts on car_images" ON car_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated updates on car_images" ON car_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated deletes on car_images" ON car_images FOR DELETE USING (auth.role() = 'authenticated');

-- Reviews Table
CREATE POLICY "Allow authenticated inserts on reviews" ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated updates on reviews" ON reviews FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated deletes on reviews" ON reviews FOR DELETE USING (auth.role() = 'authenticated');

-- Partners Table
CREATE POLICY "Allow authenticated inserts on partners" ON partners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated updates on partners" ON partners FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated deletes on partners" ON partners FOR DELETE USING (auth.role() = 'authenticated');

-- Site Settings Table
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated updates on site_settings" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');
