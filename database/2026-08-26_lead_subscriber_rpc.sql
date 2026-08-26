-- ==========================================================================
-- SwissCars — close the anonymous direct-insert bypass on leads/subscribers
-- Date: 2026-08-26
--
-- Depends on: 2026-08-26_security_hardening.sql (is_admin(), admin policies).
-- Run in the Supabase SQL Editor after that migration.
--
-- Problem: leads_inquiries and subscribers both carry a blanket
-- `FOR INSERT TO anon WITH CHECK (true)` policy. The public anon key is
-- necessarily shipped to the browser, so anyone can call the Supabase REST
-- API directly and insert rows that skip:
--   - Zod validation in lib/actions/leads.ts / lib/actions/subscribers.ts
--   - the in-memory IP rate limiter
--   - the notification flow
--
-- Fix: move the insert logic into two SECURITY DEFINER functions that
-- validate their inputs, then replace the blanket anon INSERT policy with
-- EXECUTE grants on those functions only. This does not add distributed
-- rate limiting (see the note at the bottom) — it only removes the ability
-- to write arbitrary/invalid rows straight into the tables.
--
-- Requires an application change shipped in the SAME deploy: lib/actions/
-- leads.ts, app/api/contact/route.ts, and lib/actions/subscribers.ts must
-- call supabase.rpc(...) instead of .from(...).insert(...). Do not run this
-- half-applied — the public lead form and newsletter signup break until
-- both sides are deployed together.
-- ==========================================================================


-- ==========================================================================
-- 1. submit_lead()
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.submit_lead(
  p_car_id text,
  p_car_name text,
  p_name text,
  p_phone text,
  p_email text,
  p_message text,
  p_preferred_date text,
  p_form_type text,
  p_source_url text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_name IS NULL OR length(trim(p_name)) < 2 OR length(p_name) > 100 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;

  IF p_phone IS NULL OR length(trim(p_phone)) < 7 OR length(p_phone) > 35 THEN
    RAISE EXCEPTION 'invalid_phone' USING ERRCODE = '22023';
  END IF;

  IF p_email IS NOT NULL AND p_email <> ''
     AND p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;

  IF p_form_type IS NOT NULL
     AND p_form_type NOT IN ('inquiry', 'contact', 'callback', 'testdrive') THEN
    RAISE EXCEPTION 'invalid_form_type' USING ERRCODE = '22023';
  END IF;

  IF p_message IS NOT NULL AND length(p_message) > 2000 THEN
    RAISE EXCEPTION 'invalid_message' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.leads_inquiries (
    car_id, car_name, name, phone, email, message, preferred_date, form_type, source_url
  ) VALUES (
    p_car_id,
    left(nullif(trim(p_car_name), ''), 200),
    left(trim(p_name), 100),
    left(trim(p_phone), 35),
    nullif(left(trim(p_email), 255), ''),
    nullif(left(p_message, 2000), ''),
    nullif(left(p_preferred_date, 100), ''),
    coalesce(nullif(p_form_type, ''), 'inquiry'),
    nullif(left(p_source_url, 2000), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_lead(text, text, text, text, text, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_lead(text, text, text, text, text, text, text, text, text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON leads_inquiries;


-- ==========================================================================
-- 2. subscribe_email()
-- ==========================================================================
-- Also fixes a functional bug (found in the 2026-08-26 audit): the old
-- subscribe() flow did a SELECT as anon to check for an existing row, but
-- anon never had a SELECT policy on subscribers, so that lookup silently
-- returned nothing and a duplicate signup fell through to INSERT, hit the
-- unique constraint, and showed a generic "Failed to subscribe" instead of
-- "Already subscribed". A SECURITY DEFINER function can see the existing
-- row internally without needing to grant anon SELECT on the whole table.

CREATE OR REPLACE FUNCTION public.subscribe_email(p_email text)
RETURNS text -- 'subscribed' | 'resubscribed' | 'already_subscribed'
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_existing record;
BEGIN
  IF v_email IS NULL OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;

  SELECT id, is_active INTO v_existing FROM public.subscribers WHERE email = v_email;

  IF NOT FOUND THEN
    INSERT INTO public.subscribers (email) VALUES (v_email);
    RETURN 'subscribed';
  ELSIF v_existing.is_active THEN
    RETURN 'already_subscribed';
  ELSE
    UPDATE public.subscribers
    SET is_active = true, unsubscribed_at = NULL
    WHERE id = v_existing.id;
    RETURN 'resubscribed';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.subscribe_email(text) FROM public;
GRANT EXECUTE ON FUNCTION public.subscribe_email(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;


-- ==========================================================================
-- 3. STILL NOT SOLVED HERE — distributed rate limiting
-- ==========================================================================
-- This migration stops arbitrary/invalid rows and direct table writes. It
-- does not add real rate limiting: lib/utils/rateLimit.ts is in-memory and
-- resets on every cold start / across every serverless instance, and this
-- migration doesn't replace it with anything durable.
--
-- If lead-form spam becomes a real problem, options in order of effort:
--   a) A durable counter (Upstash Redis, or a Postgres table keyed by a
--      hashed IP with a short TTL) checked inside submit_lead() itself,
--      which would also close the "call the RPC directly, ignore the app's
--      rate limiter" gap.
--   b) Cloudflare Turnstile / hCaptcha on the two public forms.
--   c) A honeypot field, cheap but weak on its own.


-- ==========================================================================
-- 4. VERIFY
-- ==========================================================================
-- select proname, prosecdef from pg_proc where proname in ('submit_lead','subscribe_email');
-- select tablename, policyname, roles from pg_policies where tablename in ('leads_inquiries','subscribers');
