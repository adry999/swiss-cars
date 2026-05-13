-- ==========================================
-- STORAGE SETUP (Run this in Supabase SQL Editor)
-- ==========================================

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-images', 'car-images', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Clear old policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- 3. Create the policies
-- Allow everyone to view images
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'car-images');

-- Allow authenticated users to upload images
CREATE POLICY "Public Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'car-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Admin Delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'car-images' AND auth.role() = 'authenticated');
