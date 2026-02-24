import { nanoid } from 'nanoid'

const SESSION_KEY = 'vcard_session_id'
const SAVED_CARDS_KEY = 'vcard_saved_cards'

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY)

  if (!sessionId) {
    sessionId = nanoid(24)
    localStorage.setItem(SESSION_KEY, sessionId)
  }

  return sessionId
}

export interface SavedCardInfo {
  id: string
  shortcode: string | null
  firstName: string
  lastName: string
  organization: string
  createdAt: string
}

export function getSavedCards(): SavedCardInfo[] {
  const saved = localStorage.getItem(SAVED_CARDS_KEY)
  if (!saved) return []

  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

export function addSavedCard(card: SavedCardInfo): void {
  const cards = getSavedCards()
  const existing = cards.findIndex(c => c.id === card.id)

  if (existing >= 0) {
    cards[existing] = card
  } else {
    cards.unshift(card)
  }

  localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(cards))
}

export function removeSavedCard(id: string): void {
  const cards = getSavedCards().filter(c => c.id !== id)
  localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(cards))
}
