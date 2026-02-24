import { useState, useEffect } from 'react'
import { getSavedCards, removeSavedCard, type SavedCardInfo } from '../lib/session'
import { supabase } from '../lib/supabase'
import { FolderOpen, Trash2, User, Building2, Calendar, X } from 'lucide-react'

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

interface MyCardsProps {
  onLoadCard: (data: VCardData) => void
  onClose: () => void
}

export default function MyCards({ onLoadCard, onClose }: MyCardsProps) {
  const [cards, setCards] = useState<SavedCardInfo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCards(getSavedCards())
  }, [])

  const loadCard = async (cardId: string) => {
    if (!supabase) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vcards')
        .select('*')
        .eq('id', cardId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        onLoadCard({
          photo: data.photo_url,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          title: data.title || '',
          organization: data.organization || '',
          phoneMobile: data.phone_mobile || '',
          phoneWork: data.phone_work || '',
          phoneFax: data.phone_fax || '',
          emailPrimary: data.email_primary || '',
          emailSecondary: data.email_secondary || '',
          website: data.website || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          addressStreet: data.address_street || '',
          addressCity: data.address_city || '',
          addressState: data.address_state || '',
          addressZip: data.address_zip || '',
          addressCountry: data.address_country || '',
        })
        onClose()
      }
    } catch (err) {
      console.error('Failed to load card:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteCard = (cardId: string) => {
    removeSavedCard(cardId)
    setCards(getSavedCards())
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2A2D59] to-[#7393CC] flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">My Cards</h2>
              <p className="text-sm text-slate-400">Load a previously saved contact card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 mb-2">No saved cards yet</p>
              <p className="text-sm text-slate-500">Cards you create will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-[#7393CC] flex-shrink-0" />
                        <h3 className="font-medium text-white truncate">
                          {card.firstName} {card.lastName}
                        </h3>
                      </div>
                      {card.organization && (
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <p className="text-sm text-slate-400 truncate">{card.organization}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <p className="text-xs text-slate-500">
                          {new Date(card.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadCard(card.id)}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2A2D59] to-[#7393CC] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
