import { initialData, generateVCard, safeLinkUrl, type VCardData } from './lib/vcard'
import { useState, useId, useRef, useCallback, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  Plus,
  Trash2,
  MapPin,
  Download,
  Upload,
  Sparkles,
  Camera,
  X,
  Check,
  Copy,
  QrCode,
  MessageSquare,
  Smartphone,
  FolderOpen,
} from 'lucide-react'
import ShareLink from './components/ShareLink'
import MyCards from './components/MyCards'
import { supabase } from './lib/supabase'
import { getSessionId, addSavedCard } from './lib/session'
import { nanoid } from 'nanoid'
import { downloadBrandedQRCode } from './lib/qrDownload'

// DonorElevate Brand Colors
const BRAND = {
  indigo: '#2A2D59',
  blue: '#7393CC',
  white: '#FFFFFF',
}

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: typeof User
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  const inputId = useId()
  const [focused, setFocused] = useState(false)

  return (
    <div className="group">
      <label htmlFor={inputId} className="block text-sm font-medium text-secondary mb-1.5 transition-colors group-focus-within:text-accent">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border bg-surface backdrop-blur-sm transition-all duration-300 ${
          focused
            ? 'border-[#7393CC] ring-2 ring-[#7393CC]/20 bg-surface-hover'
            : 'border-outline hover:border-outline-strong'
        }`}
      >
        <Icon className={`absolute left-3 w-5 h-5 transition-colors ${focused ? 'text-accent' : 'text-muted'}`} />
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent pl-11 pr-4 py-3 text-foreground placeholder-slate-500 outline-none"
        />
      </div>
    </div>
  )
}

function PhotoUpload({
  photo,
  onPhotoChange,
}: {
  photo: string | null
  onPhotoChange: (photo: string | null) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)

  // Track mounted state to prevent updates after unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const maxSize = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.92)

        if (mountedRef.current) {
          onPhotoChange(compressedDataUrl)
        }
      }
      img.src = reader.result as string
    }
    reader.onerror = () => {
      console.error('Failed to read file')
    }
    reader.readAsDataURL(file)

    if (e.target) {
      e.target.value = ''
    }
  }, [onPhotoChange])

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-32 h-32 rounded-full cursor-pointer overflow-hidden transition-all duration-300 ${
          photo
            ? 'ring-4 ring-[#7393CC]/50 hover:ring-[#7393CC]'
            : 'border-2 border-dashed border-outline-strong hover:border-[#7393CC]/50 bg-surface'
        }`}
      >
        {photo ? (
          <>
            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted hover:text-accent transition-colors">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-xs">Upload Photo</span>
          </div>
        )}
      </div>
      {photo && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPhotoChange(null)
          }}
          className="mt-2 text-sm text-danger hover:text-red-300 transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Remove
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

function VCardPreview({ data }: { data: VCardData }) {
  const fullName = `${data.firstName} ${data.lastName}`.trim()

  return (
    <div className="bg-panel backdrop-blur-xl rounded-2xl border border-outline p-6 space-y-4">
      <div className="flex items-center gap-4">
        {data.photo ? (
          <img src={data.photo} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-[#7393CC]/50" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2A2D59] to-[#7393CC] flex items-center justify-center text-2xl font-bold text-white">
            {data.firstName?.[0] || data.lastName?.[0] || '?'}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-foreground">{fullName || 'Your Name'}</h3>
          {data.title && <p className="text-accent">{data.title}</p>}
          {data.organization && <p className="text-muted text-sm">{data.organization}</p>}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {data.phoneMobile && (
          <div className="flex items-center gap-2 text-secondary">
            <Phone className="w-4 h-4 text-accent" />
            <span>{data.phoneMobile}</span>
            <span className="text-xs text-muted">Mobile</span>
          </div>
        )}
        {data.phoneWork && (
          <div className="flex items-center gap-2 text-secondary">
            <Phone className="w-4 h-4 text-accent" />
            <span>{data.phoneWork}</span>
            <span className="text-xs text-muted">Work</span>
          </div>
        )}
        {data.emailPrimary && (
          <div className="flex items-center gap-2 text-secondary">
            <Mail className="w-4 h-4 text-accent" />
            <span>{data.emailPrimary}</span>
          </div>
        )}
        {data.links.filter((link) => link.url.trim()).map((link, index) => (
          <div key={index} className="flex items-start gap-2 text-secondary min-w-0">
            <Globe className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span className="break-all"><span className="font-medium">{link.label.trim() || 'Website'}: </span>{link.url}</span>
          </div>
        ))}
        {(data.addressStreet || data.addressLine2 || data.addressCity || data.addressState || data.addressZip || data.addressCountry) && (
          <div className="flex items-start gap-2 text-secondary">
            <MapPin className="w-4 h-4 text-accent mt-0.5" />
            <span>
              {[data.addressStreet, data.addressLine2, data.addressCity, data.addressState, data.addressZip, data.addressCountry]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// iPhone Contact Card Preview
function IPhoneContactPreview({ data }: { data: VCardData }) {
  const fullName = `${data.firstName} ${data.lastName}`.trim()

  return (
    <div className="bg-[#1c1c1e] rounded-3xl overflow-hidden border border-white/10" style={{ maxWidth: '280px' }}>
      {/* iOS Status Bar */}
      <div className="flex items-center justify-between px-6 py-2 text-white text-xs">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>
      
      {/* Contact Header */}
      <div className="px-4 pb-4 text-center">
        {data.photo ? (
          <img src={data.photo} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-3xl font-semibold text-white mx-auto mb-3">
            {data.firstName?.[0] || data.lastName?.[0] || '?'}
          </div>
        )}
        <h3 className="text-xl font-semibold text-white">{fullName || 'New Contact'}</h3>
        {data.title && <p className="text-gray-400 text-sm">{data.title}</p>}
        {data.organization && <p className="text-gray-500 text-sm">{data.organization}</p>}
      </div>

      {/* Contact Actions */}
      <div className="flex justify-center gap-6 pb-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#007AFF]" />
          </div>
          <span className="text-[10px] text-[#007AFF] mt-1">message</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center">
            <Phone className="w-5 h-5 text-[#30D158]" />
          </div>
          <span className="text-[10px] text-[#30D158] mt-1">call</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#007AFF]" />
          </div>
          <span className="text-[10px] text-[#007AFF] mt-1">mail</span>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-[#2c2c2e] mx-3 rounded-xl mb-4 divide-y divide-white/5">
        {data.phoneMobile && (
          <div className="px-4 py-3">
            <p className="text-[#007AFF] text-sm">{data.phoneMobile}</p>
            <p className="text-gray-500 text-xs">mobile</p>
          </div>
        )}
        {data.emailPrimary && (
          <div className="px-4 py-3">
            <p className="text-[#007AFF] text-sm">{data.emailPrimary}</p>
            <p className="text-gray-500 text-xs">email</p>
          </div>
        )}
      </div>
    </div>
  )
}

// iMessage Preview
function IMessagePreview({ data }: { data: VCardData }) {
  const fullName = `${data.firstName} ${data.lastName}`.trim()

  return (
    <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden border border-white/10 p-3" style={{ maxWidth: '280px' }}>
      {/* Message bubble */}
      <div className="bg-[#2c2c2e] rounded-2xl p-3">
        {/* Contact card preview in message */}
        <div className="flex items-center gap-3 bg-[#3a3a3c] rounded-xl p-3">
          {data.photo ? (
            <img src={data.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-lg font-semibold text-white">
              {data.firstName?.[0] || data.lastName?.[0] || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{fullName || 'Contact'}</p>
            {data.organization && <p className="text-gray-400 text-sm truncate">{data.organization}</p>}
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-2 text-center">Contact Card</p>
      </div>
      <p className="text-gray-500 text-xs text-center mt-2">Tap to add to contacts</p>
    </div>
  )
}

function App() {
  const [data, setData] = useState<VCardData>(initialData)
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState<'card' | 'iphone' | 'imessage'>('card')
  const [shareableUrl, setShareableUrl] = useState<string | null>(null)
  const [showMyCards, setShowMyCards] = useState(false)
  const [currentCardId, setCurrentCardId] = useState<string | null>(null)
  const qrCodeRef = useRef<SVGSVGElement>(null)

  const updateField = useCallback(<K extends keyof VCardData>(field: K, value: VCardData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleDownload = useCallback(() => {
    const vcard = generateVCard(data)
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.firstName || 'contact'}_${data.lastName || 'card'}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [data])

  const copyVCard = useCallback(() => {
    const vcard = generateVCard(data)
    navigator.clipboard.writeText(vcard)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [data])

  const loadCard = useCallback((loadedData: VCardData) => {
    setData(loadedData)
    setStep(1)
  }, [])

  const handleDownloadQR = useCallback(() => {
    if (qrCodeRef.current) {
      downloadBrandedQRCode(qrCodeRef.current, data.firstName, data.lastName)
    }
  }, [data.firstName, data.lastName])

  useEffect(() => {
    if (!supabase || !data.firstName || !data.lastName) return

    const timeoutId = setTimeout(async () => {
      if (!supabase) return

      const sessionId = getSessionId()

      try {
        if (currentCardId) {
          const { error } = await supabase
            .from('vcards')
            .update({
              session_id: sessionId,
              first_name: data.firstName,
              last_name: data.lastName,
              title: data.title || null,
              organization: data.organization || null,
              phone_mobile: data.phoneMobile || null,
              phone_work: data.phoneWork || null,
              phone_fax: data.phoneFax || null,
              email_primary: data.emailPrimary || null,
              email_secondary: data.emailSecondary || null,
              links: data.links,
              address_line2: data.addressLine2 || null,
              photo_url: data.photo || null,
              address_street: data.addressStreet || null,
              address_city: data.addressCity || null,
              address_state: data.addressState || null,
              address_zip: data.addressZip || null,
              address_country: data.addressCountry || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentCardId)

          if (error) throw error

          addSavedCard({
            id: currentCardId,
            shortcode: null,
            firstName: data.firstName,
            lastName: data.lastName,
            organization: data.organization,
            createdAt: new Date().toISOString(),
          })
        } else {
          const shortcode = nanoid(8)
          const { data: inserted, error } = await supabase
            .from('vcards')
            .insert({
              session_id: sessionId,
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
              links: data.links,
              address_line2: data.addressLine2 || null,
              photo_url: data.photo || null,
              address_street: data.addressStreet || null,
              address_city: data.addressCity || null,
              address_state: data.addressState || null,
              address_zip: data.addressZip || null,
              address_country: data.addressCountry || null,
            })
            .select('id')
            .single()

          if (error) throw error

          if (inserted) {
            setCurrentCardId(inserted.id)
            addSavedCard({
              id: inserted.id,
              shortcode: null,
              firstName: data.firstName,
              lastName: data.lastName,
              organization: data.organization,
              createdAt: new Date().toISOString(),
            })
          }
        }
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [data, currentCardId])

  // QR code uses shareable URL if available, otherwise raw vCard text
  const vCardForQR = generateVCard(data, { includePhoto: false })
  const qrCodeValue = shareableUrl || vCardForQR

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Contact' },
    { num: 3, label: 'Social' },
    { num: 4, label: 'Address' },
  ]

  const isComplete = data.firstName || data.lastName

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <img 
            src="/logo-mark-white.png" 
            alt="DonorElevate" 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#2A2D59] p-2"
          />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#2A2D59]/40 to-[#7393CC]/20 border border-outline mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-secondary">Create beautiful contact cards</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-heading via-accent to-heading bg-clip-text text-transparent mb-4">
            vCard Creator
          </h1>
          <p className="text-muted max-w-md mx-auto mb-6">
            Generate professional contact cards with QR codes. Share your info instantly.
          </p>
          <button
            onClick={() => setShowMyCards(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-outline text-foreground hover:bg-surface-hover transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            My Cards
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <button
                    onClick={() => setStep(s.num)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                      step === s.num
                        ? 'bg-gradient-to-r from-[#2A2D59] to-[#7393CC] text-white scale-110'
                        : step > s.num
                        ? 'bg-[#7393CC]/20 text-accent border border-[#7393CC]/30'
                        : 'bg-surface text-muted border border-outline'
                    }`}
                  >
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-20 h-0.5 mx-2 transition-colors ${
                        step > s.num ? 'bg-[#7393CC]/50' : 'bg-surface-hover'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-surface backdrop-blur-xl rounded-2xl border border-outline p-6 sm:p-8">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    Basic Information
                  </h2>
                  <PhotoUpload
                    photo={data.photo}
                    onPhotoChange={(photo) => updateField('photo', photo)}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField
                      icon={User}
                      label="First Name"
                      value={data.firstName}
                      onChange={(v) => updateField('firstName', v)}
                      placeholder="John"
                    />
                    <InputField
                      icon={User}
                      label="Last Name"
                      value={data.lastName}
                      onChange={(v) => updateField('lastName', v)}
                      placeholder="Doe"
                    />
                  </div>
                  <InputField
                    icon={Building2}
                    label="Job Title"
                    value={data.title}
                    onChange={(v) => updateField('title', v)}
                    placeholder="Software Engineer"
                  />
                  <InputField
                    icon={Building2}
                    label="Organization"
                    value={data.organization}
                    onChange={(v) => updateField('organization', v)}
                    placeholder="Acme Inc."
                  />
                </div>
              )}

              {/* Step 2: Contact */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Phone className="w-5 h-5 text-accent" />
                    Contact Details
                  </h2>
                  <InputField
                    icon={Phone}
                    label="Mobile Phone"
                    value={data.phoneMobile}
                    onChange={(v) => updateField('phoneMobile', v)}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                  <InputField
                    icon={Phone}
                    label="Work Phone"
                    value={data.phoneWork}
                    onChange={(v) => updateField('phoneWork', v)}
                    placeholder="+1 (555) 000-0001"
                    type="tel"
                  />
                  <InputField
                    icon={Phone}
                    label="Fax (Optional)"
                    value={data.phoneFax}
                    onChange={(v) => updateField('phoneFax', v)}
                    placeholder="+1 (555) 000-0002"
                    type="tel"
                  />
                  <InputField
                    icon={Mail}
                    label="Primary Email"
                    value={data.emailPrimary}
                    onChange={(v) => updateField('emailPrimary', v)}
                    placeholder="john@example.com"
                    type="email"
                  />
                  <InputField
                    icon={Mail}
                    label="Secondary Email"
                    value={data.emailSecondary}
                    onChange={(v) => updateField('emailSecondary', v)}
                    placeholder="john.doe@company.com"
                    type="email"
                  />
                </div>
              )}

              {/* Step 3: Social */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent" />
                    Social & Web
                  </h2>
                  <p className="text-sm text-muted">Add your links and choose the names shown on your card.</p>
                  {data.links.map((link, index) => (
                    <div key={index} className="space-y-3 rounded-xl border border-outline p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Link {index + 1}</span>
                        <button type="button" aria-label={`Remove link ${index + 1}`} onClick={() => updateField('links', data.links.filter((_, i) => i !== index))} className="p-2 rounded-lg text-muted hover:text-danger hover:bg-surface">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <InputField icon={Globe} label="Link name" value={link.label} placeholder="e.g. Schedule a meeting" onChange={(label) => updateField('links', data.links.map((item, i) => i === index ? { ...item, label } : item))} />
                      <InputField icon={Globe} label="Link URL" value={link.url} placeholder="https://example.com" onChange={(url) => updateField('links', data.links.map((item, i) => i === index ? { ...item, url } : item))} />
                      {link.url.trim() && !safeLinkUrl(link.url) && (
                        <p role="alert" className="text-sm text-warning">Enter a valid web address. This link will not be included in downloads or shared cards until corrected.</p>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => updateField('links', [...data.links, { label: '', url: '' }])} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-strong text-foreground hover:bg-surface-hover">
                    <Plus className="w-4 h-4" /> Add link
                  </button>
                </div>
              )}

              {/* Step 4: Address */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Address (Optional)
                  </h2>
                  <InputField
                    icon={MapPin}
                    label="Street Address"
                    value={data.addressStreet}
                    onChange={(v) => updateField('addressStreet', v)}
                    placeholder="123 Main Street"
                  />
                  <InputField
                    icon={MapPin}
                    label="Address Line 2 (Optional)"
                    value={data.addressLine2}
                    onChange={(v) => updateField('addressLine2', v)}
                    placeholder="Apartment, suite, unit, building, etc."
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField
                      icon={MapPin}
                      label="City"
                      value={data.addressCity}
                      onChange={(v) => updateField('addressCity', v)}
                      placeholder="New York"
                    />
                    <InputField
                      icon={MapPin}
                      label="State / Province"
                      value={data.addressState}
                      onChange={(v) => updateField('addressState', v)}
                      placeholder="NY"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField
                      icon={MapPin}
                      label="ZIP / Postal Code"
                      value={data.addressZip}
                      onChange={(v) => updateField('addressZip', v)}
                      placeholder="10001"
                    />
                    <InputField
                      icon={MapPin}
                      label="Country"
                      value={data.addressCountry}
                      onChange={(v) => updateField('addressCountry', v)}
                      placeholder="United States"
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-outline">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="px-4 py-2 rounded-xl border border-outline text-muted hover:text-foreground hover:border-outline-strong transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {step < 4 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(4, s + 1))}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#2A2D59] to-[#7393CC] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    disabled={!isComplete}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#2A2D59] to-[#7393CC] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Download vCard
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Live Preview
              </h2>

              {/* Preview Mode Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPreviewMode('card')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    previewMode === 'card'
                      ? 'bg-[#7393CC]/20 text-accent border border-[#7393CC]/30'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Card
                </button>
                <button
                  onClick={() => setPreviewMode('iphone')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    previewMode === 'iphone'
                      ? 'bg-[#7393CC]/20 text-accent border border-[#7393CC]/30'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  iPhone
                </button>
                <button
                  onClick={() => setPreviewMode('imessage')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    previewMode === 'imessage'
                      ? 'bg-[#7393CC]/20 text-accent border border-[#7393CC]/30'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  iMessage
                </button>
              </div>

              {/* Preview Content */}
              <div className="flex justify-center">
                {previewMode === 'card' && <VCardPreview data={data} />}
                {previewMode === 'iphone' && <IPhoneContactPreview data={data} />}
                {previewMode === 'imessage' && <IMessagePreview data={data} />}
              </div>

              {/* QR Code Section - Always visible when there's data */}
              <div className="mt-6 bg-surface backdrop-blur-xl rounded-2xl border border-outline p-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-accent" />
                  QR Code
                </h3>

                {isComplete ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeSVG
                        ref={qrCodeRef}
                        value={qrCodeValue}
                        size={180}
                        level="M"
                        includeMargin={false}
                        fgColor={BRAND.indigo}
                      />
                    </div>
                    <p className="text-xs text-muted mt-3 text-center">
                      {shareableUrl ? 'Scan to view and save contact' : 'Scan to add contact to your phone'}
                    </p>
                    {!shareableUrl && (
                      <p className="text-xs text-accent mt-2 text-center">
                        Tip: Generate a share link for better compatibility
                      </p>
                    )}
                    <button
                      onClick={handleDownloadQR}
                      className="mt-4 px-4 py-2 rounded-lg bg-surface border border-outline text-foreground text-sm hover:bg-surface-hover transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download QR Code
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted text-center py-8">
                    Enter at least a name to generate QR code
                  </p>
                )}
              </div>

              {/* Shareable Link with Tracking */}
              <div className="mt-6">
                <ShareLink
                  data={data}
                  isComplete={!!isComplete}
                  onUrlGenerated={setShareableUrl}
                  currentCardId={currentCardId}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={handleDownload}
                  disabled={!isComplete}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#2A2D59] to-[#7393CC] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  Download .vcf
                </button>
                <button
                  onClick={copyVCard}
                  disabled={!isComplete}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-outline text-foreground font-medium hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-accent" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy vCard
                    </>
                  )}
                </button>
              </div>

              {/* Branding */}
              <div className="mt-8 text-center">
                <p className="text-xs text-muted">
                  Powered by{' '}
                  <a
                    href="https://donorelevate.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    DonorElevate
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMyCards && (
        <MyCards
          onLoadCard={loadCard}
          onClose={() => setShowMyCards(false)}
        />
      )}
    </div>
  )
}

export default App
