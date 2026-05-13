-- ==========================================
-- MIGRATION: Adaugare coloana source_url in leads_inquiries
-- Rulati acest script in Supabase SQL Editor
-- ==========================================

ALTER TABLE leads_inquiries
ADD COLUMN IF NOT EXISTS source_url TEXT;
