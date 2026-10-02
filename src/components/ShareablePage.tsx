import { generateVCard, recordLinks, safeLinkUrl } from '../lib/vcard'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { VCardRecord } from '../lib/supabase'
import { Download, Phone, Mail, Globe, MapPin, Building2, User, CheckCircle } from 'lucide-react'

// DonorElevate Brand Colors
const BRAND = {
  indigo: '#2A2D59',
  blue: '#7393CC',
  white: '#FFFFFF',
}

export default function ShareablePage() {
  const { shortcode } = useParams<{ shortcode: string }>()
  const [vcard, setVcard] = useState<VCardRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Track page view on load
  useEffect(() => {
    async function loadVCard() {
      if (!supabase || !shortcode) {
        setError('Configuration error')
        setLoading(false)
        return
      }

      try {
        // Fetch vCard data
        const { data, error: fetchError } = await supabase
          .from('vcards')
          .select('*')
          .eq('shortcode', shortcode)
          .single()

        if (fetchError || !data) {
          setError('Contact not found')
          setLoading(false)
          return
        }

        setVcard(data)

        // Track page view
        await supabase.from('vcard_events').insert({
          vcard_id: data.id,
          event_type: 'page_view',
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        })
      } catch {
        setError('Failed to load contact')
      } finally {
        setLoading(false)
      }
    }

    loadVCard()
  }, [shortcode])

  // Generate vCard string
  const generateVCardString = useCallback(() => {
    if (!vcard) return ''

    return generateVCard({
      photo: vcard.photo_url,
      firstName: vcard.first_name,
      lastName: vcard.last_name,
      title: vcard.title || '',
      organization: vcard.organization || '',
      phoneMobile: vcard.phone_mobile || '',
      phoneWork: vcard.phone_work || '',
      phoneFax: vcard.phone_fax || '',
      emailPrimary: vcard.email_primary || '',
      emailSecondary: vcard.email_secondary || '',
      links: recordLinks(vcard),
      addressStreet: vcard.address_street || '',
      addressLine2: vcard.address_line2 || '',
      addressCity: vcard.address_city || '',
      addressState: vcard.address_state || '',
      addressZip: vcard.address_zip || '',
      addressCountry: vcard.address_country || '',
    })
  }, [vcard])

  // Handle save contact click
  const handleSaveContact = async () => {
    if (!vcard || !supabase) return

    // Track save click
    await supabase.from('vcard_events').insert({
      vcard_id: vcard.id,
      event_type: 'save_click',
      user_agent: navigator.userAgent,
    })

    // Generate and download vCard
    const vcardString = generateVCardString()
    const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${vcard.first_name}_${vcard.last_name}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setSaved(true)

    // Track download
    await supabase.from('vcard_events').insert({
      vcard_id: vcard.id,
      event_type: 'download',
      user_agent: navigator.userAgent,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    )
  }

  if (error || !vcard) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Contact Not Found</h1>
          <p className="text-muted">This link may have expired or been removed.</p>
        </div>
      </div>
    )
  }

  const fullName = `${vcard.first_name} ${vcard.last_name}`

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface-hover backdrop-blur-xl rounded-3xl border border-outline-strong overflow-hidden shadow-2xl">
          {/* Header with gradient */}
          <div 
            className="h-24 relative"
            style={{ background: `linear-gradient(135deg, ${BRAND.indigo}, ${BRAND.blue})` }}
          >
            {/* Photo */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full border-4 border-outline overflow-hidden bg-panel flex items-center justify-center">
                {vcard.photo_url ? (
                  <img src={vcard.photo_url} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted" />
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-16 pb-8 px-6">
            {/* Name & Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
              {vcard.title && (
                <p className="text-secondary mt-1">{vcard.title}</p>
              )}
              {vcard.organization && (
                <p className="text-muted text-sm flex items-center justify-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" />
                  {vcard.organization}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              {vcard.phone_mobile && (
                <a 
                  href={`tel:${vcard.phone_mobile}`}
                  className="flex items-center gap-3 p-3 bg-surface rounded-xl hover:bg-surface-hover transition-colors"
                >
                  <Phone className="w-5 h-5 text-accent" />
                  <span className="text-foreground">{vcard.phone_mobile}</span>
                </a>
              )}
              {vcard.email_primary && (
                <a 
                  href={`mailto:${vcard.email_primary}`}
                  className="flex items-center gap-3 p-3 bg-surface rounded-xl hover:bg-surface-hover transition-colors"
                >
                  <Mail className="w-5 h-5 text-accent" />
                  <span className="text-foreground text-sm">{vcard.email_primary}</span>
                </a>
              )}
              {recordLinks(vcard).map((link, index) => {
                const href = safeLinkUrl(link.url)
                if (!href) return null
                return (
                  <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-surface rounded-xl hover:bg-surface-hover transition-colors">
                    <Globe className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-foreground text-sm break-all">{link.label.trim() || link.url}</span>
                  </a>
                )
              })}
              {(vcard.address_street || vcard.address_line2 || vcard.address_city || vcard.address_state || vcard.address_zip || vcard.address_country) && (
                <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="text-foreground text-sm">
                    {[vcard.address_street, vcard.address_line2, vcard.address_city, vcard.address_state, vcard.address_zip, vcard.address_country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveContact}
              disabled={saved}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-green-500/20 text-success border border-green-500/30'
                  : 'bg-gradient-to-r from-[#2A2D59] to-[#7393CC] text-white hover:opacity-90 hover:scale-[1.02]'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Contact Saved!
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Save Contact
                </>
              )}
            </button>

            {/* Trust indicator */}
            <p className="text-center text-xs text-muted mt-4">
              Tap to save {vcard.first_name}'s contact info to your phone
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-6">
          <a
            href="https://donorelevate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:text-muted transition-colors"
          >
            Powered by DonorElevate
          </a>
        </div>
      </div>
    </div>
  )
}
