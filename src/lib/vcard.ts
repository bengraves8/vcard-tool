export interface ContactLink {
  label: string
  url: string
}

export function safeLinkUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed || /[\r\n]/.test(trimmed)) return null
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')
}

export function recordLinks(record: { links?: ContactLink[] | null; website?: string | null; linkedin?: string | null; twitter?: string | null }): ContactLink[] {
  return record.links ?? [
    { label: 'Website', url: record.website || '' },
    { label: 'LinkedIn', url: record.linkedin || '' },
    { label: 'Twitter / X', url: record.twitter || '' },
  ]
}

export interface VCardData {
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
  links: ContactLink[]
  addressLine2: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  addressCountry: string
}

export const initialData: VCardData = {
  photo: null,
  firstName: '',
  lastName: '',
  title: '',
  organization: '',
  phoneMobile: '',
  phoneWork: '',
  phoneFax: '',
  emailPrimary: '',
  emailSecondary: '',
  links: [
    { label: 'Website', url: '' },
    { label: 'LinkedIn', url: '' },
    { label: 'Twitter / X', url: '' },
  ],
  addressLine2: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressZip: '',
  addressCountry: '',
}

export function generateVCard(data: VCardData, options?: { includePhoto?: boolean }): string {
  const includePhoto = options?.includePhoto ?? true
  
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ]

  if (data.firstName || data.lastName) {
    lines.push(`N:${data.lastName};${data.firstName};;;`)
    lines.push(`FN:${data.firstName} ${data.lastName}`.trim())
  }

  if (data.organization) lines.push(`ORG:${data.organization}`)
  if (data.title) lines.push(`TITLE:${data.title}`)
  if (data.phoneMobile) lines.push(`TEL;TYPE=CELL:${data.phoneMobile}`)
  if (data.phoneWork) lines.push(`TEL;TYPE=WORK:${data.phoneWork}`)
  if (data.phoneFax) lines.push(`TEL;TYPE=FAX:${data.phoneFax}`)
  if (data.emailPrimary) lines.push(`EMAIL;TYPE=INTERNET,PREF:${data.emailPrimary}`)
  if (data.emailSecondary) lines.push(`EMAIL;TYPE=INTERNET:${data.emailSecondary}`)
  data.links.forEach((link, index) => {
    const url = safeLinkUrl(link.url)
    if (!url) return
    lines.push(`item${index + 1}.URL:${url}`)
    lines.push(`item${index + 1}.X-ABLabel:${escapeText(link.label.trim() || 'Website')}`)
  })

  const address = ['', data.addressLine2, data.addressStreet, data.addressCity, data.addressState, data.addressZip, data.addressCountry]
  if (address.some(Boolean)) {
    lines.push(`ADR;TYPE=WORK:${address.map(escapeText).join(';')}`)
  }

  // Only include photo if requested (QR codes can't handle large base64 data)
  if (includePhoto && data.photo) {
    const base64Match = data.photo.match(/^data:image\/(\w+);base64,(.+)$/)
    if (base64Match) {
      const [, imageType, base64Data] = base64Match
      lines.push(`PHOTO;ENCODING=b;TYPE=${imageType.toUpperCase()}:${base64Data}`)
    }
  }

  lines.push('END:VCARD')
  lines.push('')
  return lines.join('\r\n')
}

