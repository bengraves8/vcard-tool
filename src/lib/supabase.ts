import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured - tracking disabled')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface VCardRecord {
  id: string
  shortcode: string
  first_name: string
  last_name: string
  title: string | null
  organization: string | null
  phone_mobile: string | null
  phone_work: string | null
  email_primary: string | null
  email_secondary: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  photo_url: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  address_country: string | null
  created_at: string
  updated_at: string
}

export interface VCardEvent {
  id: string
  vcard_id: string
  event_type: 'page_view' | 'save_click' | 'download' | 'qr_scan'
  user_agent: string | null
  ip_hash: string | null
  referrer: string | null
  created_at: string
}

export interface VCardStats {
  page_views: number
  save_clicks: number
  downloads: number
  qr_scans: number
  conversion_rate: number
}
