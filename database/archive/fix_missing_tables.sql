-- ==========================================
-- DATABASE FIX: Missing Subscribers & Leads Tables
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policies for Subscribers
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Anyone can subscribe') THEN
        CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT TO anon WITH CHECK (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Authenticated users can manage subscribers') THEN
        CREATE POLICY "Authenticated users can manage subscribers" ON subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;


-- 2. Create Leads Inquiries Table
CREATE TABLE IF NOT EXISTS leads_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id TEXT,
    car_name TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster sorting
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads_inquiries(created_at);

-- Enable Row Level Security
ALTER TABLE leads_inquiries ENABLE ROW LEVEL SECURITY;

-- Policies for Leads
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads_inquiries' AND policyname = 'Anyone can submit a lead') THEN
        CREATE POLICY "Anyone can submit a lead" ON leads_inquiries FOR INSERT TO anon WITH CHECK (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads_inquiries' AND policyname = 'Authenticated users can manage leads') THEN
        CREATE POLICY "Authenticated users can manage leads" ON leads_inquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
