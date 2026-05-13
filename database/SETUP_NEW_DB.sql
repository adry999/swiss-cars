-- ==========================================
-- SWISS CARS — SETUP COMPLET BAZA DE DATE
-- Rulează în ordine în Supabase SQL Editor
-- ==========================================

-- ==========================================
-- 1. TABELE
-- ==========================================

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

CREATE TABLE IF NOT EXISTS car_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  logo_url TEXT,
  website_url TEXT,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id TEXT,
  car_name TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  preferred_date TEXT,
  form_type TEXT DEFAULT 'inquiry',
  source_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- ==========================================
-- 2. INDEXURI
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads_inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active);

-- ==========================================
-- 3. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. POLITICI READ PUBLIC
-- ==========================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Allow public read-only access on cars') THEN
    CREATE POLICY "Allow public read-only access on cars" ON cars FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'car_images' AND policyname = 'Allow public read-only access on car_images') THEN
    CREATE POLICY "Allow public read-only access on car_images" ON car_images FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Allow public read-only access on reviews') THEN
    CREATE POLICY "Allow public read-only access on reviews" ON reviews FOR SELECT USING (is_visible = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Allow public read-only access on partners') THEN
    CREATE POLICY "Allow public read-only access on partners" ON partners FOR SELECT USING (is_visible = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow public read on site_settings') THEN
    CREATE POLICY "Allow public read on site_settings" ON site_settings FOR SELECT USING (true);
  END IF;
END $$;

-- ==========================================
-- 5. POLITICI WRITE (AUTHENTICATED)
-- ==========================================

-- Cars
DO $$ BEGIN
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

-- Car Images
DO $$ BEGIN
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

-- Reviews
DO $$ BEGIN
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

-- Partners
DO $$ BEGIN
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

-- Site Settings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow authenticated inserts on site_settings') THEN
    CREATE POLICY "Allow authenticated inserts on site_settings" ON site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow authenticated updates on site_settings') THEN
    CREATE POLICY "Allow authenticated updates on site_settings" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Leads
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads_inquiries' AND policyname = 'Anyone can submit a lead') THEN
    CREATE POLICY "Anyone can submit a lead" ON leads_inquiries FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads_inquiries' AND policyname = 'Authenticated users can manage leads') THEN
    CREATE POLICY "Authenticated users can manage leads" ON leads_inquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Subscribers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Anyone can subscribe') THEN
    CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Authenticated users can manage subscribers') THEN
    CREATE POLICY "Authenticated users can manage subscribers" ON subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ==========================================
-- 6. STORAGE BUCKET
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-images');

CREATE POLICY "Public Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'car-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'car-images' AND auth.role() = 'authenticated');

-- ==========================================
-- 7. DATE INITIALE
-- ==========================================

INSERT INTO site_settings (key, value)
VALUES 
  ('contact_info', '{"phone": "+41 78 323 31 50", "email": "info@swisscars.md", "address": "Switzerland", "whatsapp": "+41783233150"}'),
  ('site_config', '{"logo_url": "", "logo_height": 80, "header_height": 80, "gtm_id": ""}')
ON CONFLICT (key) DO NOTHING;
