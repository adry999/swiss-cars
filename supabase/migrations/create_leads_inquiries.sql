-- Migration: Create leads_inquiries table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id TEXT,
    car_name TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE leads_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (for form submissions from public visitors)
CREATE POLICY "Allow public inserts on leads_inquiries"
    ON leads_inquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow authenticated admin to read all leads
CREATE POLICY "Allow authenticated read on leads_inquiries"
    ON leads_inquiries
    FOR SELECT
    TO authenticated
    USING (true);
