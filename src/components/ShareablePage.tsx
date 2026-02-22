import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { VCardRecord } from '../lib/supabase'
import { Download, Phone, Mail, Globe, MapPin, Linkedin, Building2, User, CheckCircle } from 'lucide-react'

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

    const lines: string[] = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${vcard.last_name};${vcard.first_name};;;`,
      `FN:${vcard.first_name} ${vcard.last_name}`,
    ]

    if (vcard.organization) lines.push(`ORG:${vcard.organization}`)
    if (vcard.title) lines.push(`TITLE:${vcard.title}`)
    if (vcard.phone_mobile) lines.push(`TEL;TYPE=CELL:${vcard.phone_mobile}`)
    if (vcard.phone_work) lines.push(`TEL;TYPE=WORK:${vcard.phone_work}`)
    if (vcard.email_primary) lines.push(`EMAIL;TYPE=INTERNET,PREF:${vcard.email_primary}`)
    if (vcard.email_secondary) lines.push(`EMAIL;TYPE=INTERNET:${vcard.email_secondary}`)
    if (vcard.website) lines.push(`URL:${vcard.website}`)
    if (vcard.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${vcard.linkedin}`)
    if (vcard.twitter) lines.push(`X-SOCIALPROFILE;TYPE=twitter:${vcard.twitter}`)

    if (vcard.address_street || vcard.address_city) {
      lines.push(`ADR;TYPE=WORK:;;${vcard.address_street || ''};${vcard.address_city || ''};${vcard.address_state || ''};${vcard.address_zip || ''};${vcard.address_country || ''}`)
    }

    if (vcard.photo_url && vcard.photo_url.startsWith('data:image')) {
      const match = vcard.photo_url.match(/^data:image\/(\w+);base64,(.+)$/)
      if (match) {
        lines.push(`PHOTO;ENCODING=b;TYPE=${match[1].toUpperCase()}:${match[2]}`)
      }
    }

    lines.push('END:VCARD')
    return lines.join('\r\n')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  if (error || !vcard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">Contact Not Found</h1>
          <p className="text-slate-400">This link may have expired or been removed.</p>
        </div>
      </div>
    )
  }

  const fullName = `${vcard.first_name} ${vcard.last_name}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
          {/* Header with gradient */}
          <div 
            className="h-24 relative"
            style={{ background: `linear-gradient(135deg, ${BRAND.indigo}, ${BRAND.blue})` }}
          >
            {/* Photo */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-700 flex items-center justify-center">
                {vcard.photo_url ? (
                  <img src={vcard.photo_url} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-16 pb-8 px-6">
            {/* Name & Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">{fullName}</h1>
              {vcard.title && (
                <p className="text-slate-300 mt-1">{vcard.title}</p>
              )}
              {vcard.organization && (
                <p className="text-slate-400 text-sm flex items-center justify-center gap-1 mt-1">
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
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#7393CC]" />
                  <span className="text-white">{vcard.phone_mobile}</span>
                </a>
              )}
              {vcard.email_primary && (
                <a 
                  href={`mailto:${vcard.email_primary}`}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Mail className="w-5 h-5 text-[#7393CC]" />
                  <span className="text-white text-sm">{vcard.email_primary}</span>
                </a>
              )}
              {vcard.website && (
                <a 
                  href={vcard.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Globe className="w-5 h-5 text-[#7393CC]" />
                  <span className="text-white text-sm">{vcard.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {vcard.linkedin && (
                <a 
                  href={vcard.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-[#7393CC]" />
                  <span className="text-white text-sm">LinkedIn Profile</span>
                </a>
              )}
              {(vcard.address_city || vcard.address_state) && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <MapPin className="w-5 h-5 text-[#7393CC]" />
                  <span className="text-white text-sm">
                    {[vcard.address_city, vcard.address_state].filter(Boolean).join(', ')}
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
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
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
            <p className="text-center text-xs text-slate-500 mt-4">
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
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            Powered by DonorElevate
          </a>
        </div>
      </div>
    </div>
  )
}
