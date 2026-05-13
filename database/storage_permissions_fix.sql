-- ==========================================
-- STORAGE PERMISSIONS FIX (Allow Public Uploads for Dev)
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Remove the restrictive authenticated-only policies
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- 2. Create permissive policies for Development
-- This allows anyone to upload so that the dashboard works without setting up email/password logins yet.
-- Before going to production, you'll want to lock this back down to authenticated users.

CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'car-images');

CREATE POLICY "Allow public deletes" ON storage.objects 
FOR DELETE USING (bucket_id = 'car-images');
