-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage subscribers (admin)
CREATE POLICY "Authenticated users can manage subscribers"
ON subscribers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous inserts (for newsletter signups)
CREATE POLICY "Anyone can subscribe"
ON subscribers
FOR INSERT
TO anon
WITH CHECK (true);
