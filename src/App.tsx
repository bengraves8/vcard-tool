import { useState, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Twitter,
  MapPin,
  Download,
  Upload,
  Sparkles,
  Camera,
  X,
  Check,
  Copy,
  QrCode,
} from 'lucide-react'

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

const initialData: VCardData = {
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
  website: '',
  linkedin: '',
  twitter: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressZip: '',
  addressCountry: '',
}

function generateVCard(data: VCardData): string {
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
  if (data.website) lines.push(`URL:${data.website}`)
  if (data.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${data.linkedin}`)
  if (data.twitter) lines.push(`X-SOCIALPROFILE;TYPE=twitter:${data.twitter}`)

  if (data.addressStreet || data.addressCity || data.addressState || data.addressZip || data.addressCountry) {
    lines.push(`ADR;TYPE=WORK:;;${data.addressStreet};${data.addressCity};${data.addressState};${data.addressZip};${data.addressCountry}`)
  }

  if (data.photo) {
    // Extract base64 data from data URL
    const base64Match = data.photo.match(/^data:image\/(\w+);base64,(.+)$/)
    if (base64Match) {
      const [, imageType, base64Data] = base64Match
      lines.push(`PHOTO;ENCODING=b;TYPE=${imageType.toUpperCase()}:${base64Data}`)
    }
  }

  lines.push('END:VCARD')
  return lines.join('\r\n')
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
  const [focused, setFocused] = useState(false)

  return (
    <div className="group">
      <label className="block text-sm font-medium text-slate-300 mb-1.5 transition-colors group-focus-within:text-teal-400">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border bg-white/5 backdrop-blur-sm transition-all duration-300 ${
          focused
            ? 'border-teal-400 ring-2 ring-teal-400/20 bg-white/10'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <Icon className={`absolute left-3 w-5 h-5 transition-colors ${focused ? 'text-teal-400' : 'text-slate-500'}`} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none"
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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onPhotoChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onPhotoChange])

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-32 h-32 rounded-full cursor-pointer overflow-hidden transition-all duration-300 ${
          photo
            ? 'ring-4 ring-teal-400/50 hover:ring-teal-400'
            : 'border-2 border-dashed border-white/20 hover:border-teal-400/50 bg-white/5'
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
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-teal-400 transition-colors">
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
          className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
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
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4">
      <div className="flex items-center gap-4">
        {data.photo ? (
          <img src={data.photo} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-teal-400/50" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-2xl font-bold">
            {data.firstName?.[0] || data.lastName?.[0] || '?'}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-white">{fullName || 'Your Name'}</h3>
          {data.title && <p className="text-teal-400">{data.title}</p>}
          {data.organization && <p className="text-slate-400 text-sm">{data.organization}</p>}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {data.phoneMobile && (
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4 text-teal-400" />
            <span>{data.phoneMobile}</span>
            <span className="text-xs text-slate-500">Mobile</span>
          </div>
        )}
        {data.phoneWork && (
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4 text-purple-400" />
            <span>{data.phoneWork}</span>
            <span className="text-xs text-slate-500">Work</span>
          </div>
        )}
        {data.emailPrimary && (
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-teal-400" />
            <span>{data.emailPrimary}</span>
          </div>
        )}
        {data.website && (
          <div className="flex items-center gap-2 text-slate-300">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>{data.website}</span>
          </div>
        )}
        {data.linkedin && (
          <div className="flex items-center gap-2 text-slate-300">
            <Linkedin className="w-4 h-4 text-blue-400" />
            <span>{data.linkedin}</span>
          </div>
        )}
        {(data.addressStreet || data.addressCity) && (
          <div className="flex items-start gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-teal-400 mt-0.5" />
            <span>
              {[data.addressStreet, data.addressCity, data.addressState, data.addressZip]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [data, setData] = useState<VCardData>(initialData)
  const [step, setStep] = useState(1)
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const vCardDataUrl = `data:text/vcard;base64,${btoa(generateVCard(data))}`

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-slate-300">Create beautiful contact cards</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-transparent mb-4">
            vCard Creator
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Generate professional contact cards with QR codes. Share your info instantly.
          </p>
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
                        ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white scale-110'
                        : step > s.num
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}
                  >
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-20 h-0.5 mx-2 transition-colors ${
                        step > s.num ? 'bg-teal-500/50' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-400" />
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
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Phone className="w-5 h-5 text-teal-400" />
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
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-teal-400" />
                    Social & Web
                  </h2>
                  <InputField
                    icon={Globe}
                    label="Website"
                    value={data.website}
                    onChange={(v) => updateField('website', v)}
                    placeholder="https://example.com"
                  />
                  <InputField
                    icon={Linkedin}
                    label="LinkedIn"
                    value={data.linkedin}
                    onChange={(v) => updateField('linkedin', v)}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                  <InputField
                    icon={Twitter}
                    label="Twitter / X"
                    value={data.twitter}
                    onChange={(v) => updateField('twitter', v)}
                    placeholder="https://x.com/johndoe"
                  />
                </div>
              )}

              {/* Step 4: Address */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    Address (Optional)
                  </h2>
                  <InputField
                    icon={MapPin}
                    label="Street Address"
                    value={data.addressStreet}
                    onChange={(v) => updateField('addressStreet', v)}
                    placeholder="123 Main Street"
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
              <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {step < 4 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(4, s + 1))}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    disabled={!isComplete}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
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
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                Live Preview
              </h2>

              <VCardPreview data={data} />

              {/* QR Code Section */}
              <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-teal-400" />
                    QR Code
                  </h3>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    {showQR ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showQR && isComplete && (
                  <div className="flex flex-col items-center animate-in fade-in duration-300">
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeSVG
                        value={vCardDataUrl}
                        size={180}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-3 text-center">
                      Scan to add contact to your phone
                    </p>
                  </div>
                )}

                {showQR && !isComplete && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Enter at least a name to generate QR code
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={handleDownload}
                  disabled={!isComplete}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  Download .vcf
                </button>
                <button
                  onClick={copyVCard}
                  disabled={!isComplete}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-teal-400" />
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
                <p className="text-xs text-slate-500">
                  Powered by{' '}
                  <a
                    href="https://donorelevate.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    DonorElevate
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
