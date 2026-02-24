import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { nanoid } from 'nanoid'
import { Link, Copy, Check, ExternalLink, BarChart3 } from 'lucide-react'

interface VCardData {
  photo: string | null
  firstName: string
  lastName: string
  title: string
  organization: string
  phoneMobile: string
  phoneWork: string
  phoneFax: string
  emailPrimary: string
  emailSecondary: string
  website: string
  linkedin: string
  twitter: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  addressCountry: string
}

interface ShareLinkProps {
  data: VCardData
  isComplete: boolean
  onUrlGenerated?: (url: string | null) => void
  currentCardId?: string | null
}

interface SavedVCard {
  shortcode: string
  id: string
}

export default function ShareLink({ data, isComplete, onUrlGenerated, currentCardId }: ShareLinkProps) {
  const [saving, setSaving] = useState(false)
  const [savedVCard, setSavedVCard] = useState<SavedVCard | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateShareLink = async () => {
    if (!supabase) {
      setError('Tracking not configured. Add Supabase credentials to enable.')
      return
    }

    if (!isComplete) return

    setSaving(true)
    setError(null)

    try {
      if (currentCardId) {
        const { data: existingCard, error: fetchError } = await supabase
          .from('vcards')
          .select('id, shortcode')
          .eq('id', currentCardId)
          .maybeSingle()

        if (fetchError) throw fetchError

        if (existingCard) {
          setSavedVCard(existingCard)
          const url = `${window.location.origin}/c/${existingCard.shortcode}`
          onUrlGenerated?.(url)
          setSaving(false)
          return
        }
      }

      const shortcode = nanoid(8)

      const { data: inserted, error: insertError } = await supabase
        .from('vcards')
        .insert({
          shortcode,
          first_name: data.firstName,
          last_name: data.lastName,
          title: data.title || null,
          organization: data.organization || null,
          phone_mobile: data.phoneMobile || null,
          phone_work: data.phoneWork || null,
          phone_fax: data.phoneFax || null,
          email_primary: data.emailPrimary || null,
          email_secondary: data.emailSecondary || null,
          website: data.website || null,
          linkedin: data.linkedin || null,
          twitter: data.twitter || null,
          photo_url: data.photo || null,
          address_street: data.addressStreet || null,
          address_city: data.addressCity || null,
          address_state: data.addressState || null,
          address_zip: data.addressZip || null,
          address_country: data.addressCountry || null,
        })
        .select('id, shortcode')
        .single()

      if (insertError) {
        throw insertError
      }

      setSavedVCard(inserted)
      const url = `${window.location.origin}/c/${inserted.shortcode}`
      onUrlGenerated?.(url)
    } catch (err) {
      console.error('Failed to create share link:', err)
      setError('Failed to create share link. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const copyLink = async () => {
    if (!savedVCard) return
    
    const url = `${window.location.origin}/c/${savedVCard.shortcode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = savedVCard ? `${window.location.origin}/c/${savedVCard.shortcode}` : null

  if (!supabase) {
    return null // Don't show if Supabase not configured
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
        <Link className="w-5 h-5 text-[#7393CC]" />
        Shareable Link
        <span className="text-xs bg-[#7393CC]/20 text-[#7393CC] px-2 py-0.5 rounded-full ml-2">
          Tracked
        </span>
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {!savedVCard ? (
        <div>
          <p className="text-sm text-slate-400 mb-4">
            Generate a trackable link that shows when recipients view or save your contact.
          </p>
          <button
            onClick={generateShareLink}
            disabled={!isComplete || saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#2A2D59] to-[#7393CC] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Link className="w-5 h-5" />
                Generate Share Link
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Link display */}
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono truncate">
              {shareUrl}
            </div>
            <button
              onClick={copyLink}
              className="px-3 py-2 rounded-lg bg-[#7393CC]/20 text-[#7393CC] hover:bg-[#7393CC]/30 transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={shareUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white text-sm hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
            <a
              href={`/analytics/${savedVCard.shortcode}`}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white text-sm hover:bg-white/5 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </a>
          </div>

          {/* SMS Template */}
          <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
            <p className="text-xs text-slate-400 mb-2">Suggested SMS message:</p>
            <p className="text-sm text-white">
              Hi! This is {data.firstName} from {data.organization || 'our organization'}. 
              Save my contact info here: {shareUrl}
            </p>
            <button
              onClick={() => {
                const msg = `Hi! This is ${data.firstName} from ${data.organization || 'our organization'}. Save my contact info here: ${shareUrl}`
                navigator.clipboard.writeText(msg)
              }}
              className="mt-2 text-xs text-[#7393CC] hover:text-[#7393CC]/80 transition-colors"
            >
              Copy message
            </button>
          </div>

          {/* Create another */}
          <button
            onClick={() => {
              setSavedVCard(null)
              onUrlGenerated?.(null)
            }}
            className="w-full text-sm text-slate-400 hover:text-white transition-colors"
          >
            Create another link
          </button>
        </div>
      )}
    </div>
  )
}
