# Database setup

## Fresh install

Run these three files, in order, in the Supabase SQL Editor:

1. **`SETUP_NEW_DB.sql`** — creates all tables, base RLS policies, the
   storage bucket, and seeds `site_settings`.
2. **`2026-08-26_security_hardening.sql`** — replaces the base RLS policies
   with role-checked ones (`app_metadata.role = 'admin'`, not merely
   "authenticated"), strips any secrets that ended up in the public
   `site_config` row, adds `updated_at` triggers and supporting indexes.
   **Read section 0 of that file before running it** — it requires granting
   yourself the admin role first, or you lock yourself out of `/admin`.
3. **`2026-08-26_lead_subscriber_rpc.sql`** — replaces the anonymous
   direct-INSERT policies on `leads_inquiries`/`subscribers` with two
   validated RPC functions. Requires the matching application code
   (`features/leads/server/supabase-leads-repository.ts`,
   `features/subscribers/server/supabase-subscribers-repository.ts`) to be
   deployed in the same release — the
   public lead form and newsletter signup will fail if this SQL runs
   without that code, or vice versa.

Run `seed_defaults.mjs` afterward if you want the default homepage copy.

## Existing database

Steps 2 and 3 above are additive migrations — run them against a database
that already has step 1 applied, in that order.
