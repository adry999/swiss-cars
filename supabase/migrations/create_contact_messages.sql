-- Migration: Create contact_messages table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    preferred_date DATE,
    form_type TEXT DEFAULT 'contact',  -- 'contact' or 'testdrive'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on contact_messages"
    ON contact_messages FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated read on contact_messages"
    ON contact_messages FOR SELECT
    TO authenticated
    USING (true);
