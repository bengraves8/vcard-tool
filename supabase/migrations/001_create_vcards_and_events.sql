-- vCard Tracking Schema
-- Run this in your Supabase SQL editor

-- Table: vcards - stores saved vCard data
CREATE TABLE IF NOT EXISTS vcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shortcode VARCHAR(12) UNIQUE NOT NULL,
  
  -- Contact info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(200),
  organization VARCHAR(200),
  
  -- Phone numbers
  phone_mobile VARCHAR(30),
  phone_work VARCHAR(30),
  phone_fax VARCHAR(30),
  
  -- Email
  email_primary VARCHAR(255),
  email_secondary VARCHAR(255),
  
  -- Web presence
  website VARCHAR(500),
  linkedin VARCHAR(500),
  twitter VARCHAR(500),
  
  -- Photo (base64 or URL)
  photo_url TEXT,
  
  -- Address
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_zip VARCHAR(20),
  address_country VARCHAR(100),
  
  -- Metadata
  created_by VARCHAR(255), -- optional: user identifier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: vcard_events - tracks all interactions
CREATE TABLE IF NOT EXISTS vcard_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vcard_id UUID REFERENCES vcards(id) ON DELETE CASCADE,
  
  -- Event type: page_view, save_click, download, qr_scan
  event_type VARCHAR(20) NOT NULL,
  
  -- Context
  user_agent TEXT,
  ip_hash VARCHAR(64), -- hashed for privacy
  referrer TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_vcards_shortcode ON vcards(shortcode);
CREATE INDEX IF NOT EXISTS idx_vcard_events_vcard_id ON vcard_events(vcard_id);
CREATE INDEX IF NOT EXISTS idx_vcard_events_created_at ON vcard_events(created_at);
CREATE INDEX IF NOT EXISTS idx_vcard_events_type ON vcard_events(event_type);

-- View: vcard_stats - aggregated stats per vCard
CREATE OR REPLACE VIEW vcard_stats AS
SELECT 
  v.id,
  v.shortcode,
  v.first_name,
  v.last_name,
  v.organization,
  v.created_at,
  COUNT(CASE WHEN e.event_type = 'page_view' THEN 1 END) as page_views,
  COUNT(CASE WHEN e.event_type = 'save_click' THEN 1 END) as save_clicks,
  COUNT(CASE WHEN e.event_type = 'download' THEN 1 END) as downloads,
  COUNT(CASE WHEN e.event_type = 'qr_scan' THEN 1 END) as qr_scans,
  CASE 
    WHEN COUNT(CASE WHEN e.event_type = 'page_view' THEN 1 END) > 0 
    THEN ROUND(
      COUNT(CASE WHEN e.event_type = 'save_click' THEN 1 END)::numeric / 
      COUNT(CASE WHEN e.event_type = 'page_view' THEN 1 END)::numeric * 100, 
      1
    )
    ELSE 0 
  END as conversion_rate
FROM vcards v
LEFT JOIN vcard_events e ON v.id = e.vcard_id
GROUP BY v.id, v.shortcode, v.first_name, v.last_name, v.organization, v.created_at;

-- RLS Policies (allow public read for shared pages, restrict writes)
ALTER TABLE vcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE vcard_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read vcards (they're meant to be shared)
CREATE POLICY "Public read vcards" ON vcards FOR SELECT USING (true);

-- Allow anyone to insert vcards (for MVP - add auth later)
CREATE POLICY "Public insert vcards" ON vcards FOR INSERT WITH CHECK (true);

-- Allow anyone to insert events (tracking)
CREATE POLICY "Public insert events" ON vcard_events FOR INSERT WITH CHECK (true);

-- Allow reading events for stats
CREATE POLICY "Public read events" ON vcard_events FOR SELECT USING (true);
