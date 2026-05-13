-- ==========================================
-- MIGRATION: Leads management + GTM support
-- ==========================================

-- 1. Add is_important column to leads_inquiries (if not already present)
ALTER TABLE leads_inquiries
  ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false;

-- 2. Make sure leads_inquiries has RLS policies for authenticated deletes/updates
-- (These may already exist from a previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads_inquiries'
    AND policyname = 'Allow authenticated updates on leads_inquiries'
  ) THEN
    CREATE POLICY "Allow authenticated updates on leads_inquiries"
      ON leads_inquiries FOR UPDATE
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads_inquiries'
    AND policyname = 'Allow authenticated deletes on leads_inquiries'
  ) THEN
    CREATE POLICY "Allow authenticated deletes on leads_inquiries"
      ON leads_inquiries FOR DELETE
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 3. Ensure site_settings allows authenticated inserts (for upsert of gtm key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'site_settings'
    AND policyname = 'Allow authenticated inserts on site_settings'
  ) THEN
    CREATE POLICY "Allow authenticated inserts on site_settings"
      ON site_settings FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
