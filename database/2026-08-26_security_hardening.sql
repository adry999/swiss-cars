-- ==========================================================================
-- SwissCars — security hardening
-- Date: 2026-08-26
--
-- Run in the Supabase SQL Editor. Read section 0 before executing.
--
-- Addresses:
--   1. Telegram credentials readable by anyone via the public anon key
--   2. Any authenticated account acting as an administrator
--   3. Hidden reviews/partners being invisible to the admin panel
--   4. Storage objects writable by any authenticated account
--   5. Missing indexes and updated_at maintenance
-- ==========================================================================


-- ==========================================================================
-- 0. BEFORE YOU RUN THIS
-- ==========================================================================
--
--  a) Rotate the Telegram bot token in BotFather (/revoke). Section 1 deletes
--     the stored copy, but it must be assumed compromised: it was readable by
--     anyone holding the public anon key, and was also serialized into the
--     HTML of every public page.
--
--  b) Put the new credentials in your host's environment variables:
--         TELEGRAM_BOT_TOKEN=...
--         TELEGRAM_CHAT_ID=...
--         NOTIFICATION_EMAIL=...
--     lib/settings/getNotificationConfig() reads these first and falls back to
--     the database only while the migration has not run yet.
--
--  c) Grant yourself the admin role (Dashboard → Authentication → Users →
--     your user → app_metadata), or via the Admin API:
--         { "role": "admin" }
--     Do this BEFORE running section 2, or you will lock yourself out of the
--     admin panel. app_metadata is signed into the JWT and cannot be edited
--     by the user; user_metadata can, so it must not be used for this.
--
--  d) Confirm public signup is disabled: Authentication → Providers → Email →
--     "Enable sign ups" off.
--
--  e) Verify what is actually deployed before and after:
--         SELECT tablename, policyname, cmd, roles, qual, with_check
--         FROM pg_policies WHERE schemaname IN ('public','storage')
--         ORDER BY tablename, policyname;
--     In particular, check that database/dev_public_policies.sql and
--     database/storage_permissions_fix.sql were never applied — they grant
--     public INSERT/UPDATE/DELETE on core tables and the storage bucket.


-- ==========================================================================
-- 1. REMOVE SECRETS FROM THE PUBLICLY READABLE SETTINGS ROW
-- ==========================================================================
-- site_settings must stay anon-readable: the public site reads site_config
-- with the anon key. So the row itself must contain nothing secret.

UPDATE site_settings
SET value = value - 'telegram_bot_token' - 'telegram_chat_id' - 'notification_email'
WHERE key = 'site_config';

-- This policy restricts which ROWS (keys) are anon-readable. It does NOT and
-- cannot filter fields inside the JSON `value` column — RLS operates on
-- rows, not on JSON keys within one. 'site_config' is itself an allowed
-- row, so if a future write puts telegram_bot_token back into that JSON
-- blob, this policy does nothing to stop it being read back out.
DROP POLICY IF EXISTS "Allow public read on site_settings" ON site_settings;

CREATE POLICY "Anon reads public settings keys"
  ON site_settings FOR SELECT
  TO anon
  USING (key IN ('site_config', 'homepage_content', 'contact_info'));

-- The actual defence against secrets re-entering site_config: a trigger
-- that strips them on every write, regardless of what wrote it (the admin
-- form, a future code change, a manual SQL/API call). Belt-and-suspenders
-- with the application no longer collecting these fields
-- (app/admin/settings/SettingsForm.tsx) and reading them from environment
-- variables (lib/settings/getNotificationConfig()).
CREATE OR REPLACE FUNCTION public.strip_site_config_secrets()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.key = 'site_config' THEN
    NEW.value := NEW.value - 'telegram_bot_token' - 'telegram_chat_id' - 'notification_email';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS site_config_strip_secrets ON site_settings;
CREATE TRIGGER site_config_strip_secrets
  BEFORE INSERT OR UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION public.strip_site_config_secrets();


-- ==========================================================================
-- 2. REAL ADMIN ROLE
-- ==========================================================================
-- Previously every policy used auth.role() = 'authenticated', which is true
-- for ANY signed-in account.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- --- cars -----------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated inserts on cars" ON cars;
DROP POLICY IF EXISTS "Allow authenticated updates on cars" ON cars;
DROP POLICY IF EXISTS "Allow authenticated deletes on cars" ON cars;
DROP POLICY IF EXISTS "Allow public inserts on cars" ON cars;
DROP POLICY IF EXISTS "Allow public updates on cars" ON cars;
DROP POLICY IF EXISTS "Allow public deletes on cars" ON cars;

CREATE POLICY "Admins manage cars" ON cars
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --- car_images -----------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated inserts on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow authenticated updates on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow authenticated deletes on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow public inserts on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow public updates on car_images" ON car_images;
DROP POLICY IF EXISTS "Allow public deletes on car_images" ON car_images;

CREATE POLICY "Admins manage car_images" ON car_images
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --- reviews --------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated inserts on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated updates on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated deletes on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public inserts on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public updates on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public deletes on reviews" ON reviews;
-- The old public SELECT policy had no TO clause, so it applied to admins too
-- and hid invisible reviews from the admin panel with no way to restore them.
DROP POLICY IF EXISTS "Allow public read-only access on reviews" ON reviews;

CREATE POLICY "Anon reads visible reviews" ON reviews
  FOR SELECT TO anon USING (is_visible = true);

CREATE POLICY "Admins manage reviews" ON reviews
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --- partners -------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated inserts on partners" ON partners;
DROP POLICY IF EXISTS "Allow authenticated updates on partners" ON partners;
DROP POLICY IF EXISTS "Allow authenticated deletes on partners" ON partners;
DROP POLICY IF EXISTS "Allow public inserts on partners" ON partners;
DROP POLICY IF EXISTS "Allow public updates on partners" ON partners;
DROP POLICY IF EXISTS "Allow public deletes on partners" ON partners;
DROP POLICY IF EXISTS "Allow public read-only access on partners" ON partners;

CREATE POLICY "Anon reads visible partners" ON partners
  FOR SELECT TO anon USING (is_visible = true);

CREATE POLICY "Admins manage partners" ON partners
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --- site_settings --------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated inserts on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated updates on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public inserts on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public updates on site_settings" ON site_settings;

CREATE POLICY "Admins manage site_settings" ON site_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --- leads_inquiries ------------------------------------------------------
-- NOTE: the anonymous INSERT policy is intentionally left in place here.
-- Removing it breaks the public lead forms, which insert through the anon
-- client. Closing it properly requires a SECURITY DEFINER submit_lead() RPC
-- plus an application change — see section 6.
DROP POLICY IF EXISTS "Authenticated users can manage leads" ON leads_inquiries;
DROP POLICY IF EXISTS "Allow authenticated updates on leads_inquiries" ON leads_inquiries;
DROP POLICY IF EXISTS "Allow authenticated deletes on leads_inquiries" ON leads_inquiries;

CREATE POLICY "Admins manage leads" ON leads_inquiries
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --- subscribers ----------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can manage subscribers" ON subscribers;

CREATE POLICY "Admins manage subscribers" ON subscribers
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ==========================================================================
-- 3. STORAGE
-- ==========================================================================
-- Reverts database/storage_permissions_fix.sql, which allowed anyone to
-- upload to and delete from the bucket.

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

CREATE POLICY "car_images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-images');

CREATE POLICY "car_images admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'car-images' AND public.is_admin());

CREATE POLICY "car_images admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'car-images' AND public.is_admin());

CREATE POLICY "car_images admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'car-images' AND public.is_admin());


-- ==========================================================================
-- 4. updated_at MAINTENANCE
-- ==========================================================================
-- cars.updated_at only ever held the creation time: DEFAULT now() with no
-- trigger and no application write.

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cars_touch_updated_at ON cars;
CREATE TRIGGER cars_touch_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS site_settings_touch_updated_at ON site_settings;
CREATE TRIGGER site_settings_touch_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ==========================================================================
-- 5. INDEXES
-- ==========================================================================
-- Supporting the hot listing, detail and admin queries.

CREATE INDEX IF NOT EXISTS idx_cars_available_created
  ON cars (is_available, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cars_featured
  ON cars (is_featured, is_available, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cars_brand_lower
  ON cars (lower(brand));

CREATE INDEX IF NOT EXISTS idx_car_images_car_id
  ON car_images (car_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_reviews_visible_created
  ON reviews (is_visible, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partners_visible_sort
  ON partners (is_visible, sort_order);

CREATE INDEX IF NOT EXISTS idx_leads_read_created
  ON leads_inquiries (is_read, created_at DESC);

-- At most one primary image per car.
CREATE UNIQUE INDEX IF NOT EXISTS idx_car_images_one_primary
  ON car_images (car_id) WHERE is_primary;


-- ==========================================================================
-- 6. NOT DONE HERE — requires an application change, do not run blind
-- ==========================================================================
-- The `anon` role can still INSERT directly into leads_inquiries and
-- subscribers using the public key, bypassing Zod validation, the IP rate
-- limiter and the notification flow.
--
-- Fixing it means:
--   a) a SECURITY DEFINER function public.submit_lead(...) that validates and
--      inserts, granted EXECUTE to anon;
--   b) revoking the direct anon INSERT policy;
--   c) changing lib/actions/leads.ts to call supabase.rpc('submit_lead', ...).
--
-- Do these three together and test the public lead form before deploying —
-- getting it half-applied takes the site's only conversion path offline.


-- ==========================================================================
-- 7. VERIFY
-- ==========================================================================
-- SELECT value ? 'telegram_bot_token' AS still_has_token
--   FROM site_settings WHERE key = 'site_config';   -- expect false
--
-- SELECT tablename, policyname, cmd, roles
--   FROM pg_policies WHERE schemaname IN ('public','storage')
--   ORDER BY tablename, policyname;
