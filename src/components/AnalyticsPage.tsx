import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Eye, Download, MousePointerClick, QrCode, TrendingUp, Clock } from 'lucide-react'

interface VCardStats {
  id: string
  shortcode: string
  first_name: string
  last_name: string
  organization: string | null
  created_at: string
  page_views: number
  save_clicks: number
  downloads: number
  qr_scans: number
  conversion_rate: number
}

interface RecentEvent {
  id: string
  event_type: string
  created_at: string
  user_agent: string | null
}

export default function AnalyticsPage() {
  const { shortcode } = useParams<{ shortcode: string }>()
  const [stats, setStats] = useState<VCardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      if (!supabase || !shortcode) {
        setError('Configuration error')
        setLoading(false)
        return
      }

      try {
        // Fetch stats from view
        const { data: statsData, error: statsError } = await supabase
          .from('vcard_stats')
          .select('*')
          .eq('shortcode', shortcode)
          .single()

        if (statsError || !statsData) {
          setError('vCard not found')
          setLoading(false)
          return
        }

        setStats(statsData)

        // Fetch recent events
        const { data: eventsData } = await supabase
          .from('vcard_events')
          .select('id, event_type, created_at, user_agent')
          .eq('vcard_id', statsData.id)
          .order('created_at', { ascending: false })
          .limit(10)

        setRecentEvents(eventsData || [])
      } catch {
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [shortcode])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-4 h-4 text-blue-400" />
      case 'save_click': return <MousePointerClick className="w-4 h-4 text-success" />
      case 'download': return <Download className="w-4 h-4 text-purple-400" />
      case 'qr_scan': return <QrCode className="w-4 h-4 text-orange-400" />
      default: return <Clock className="w-4 h-4 text-muted" />
    }
  }

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'page_view': return 'Page View'
      case 'save_click': return 'Save Clicked'
      case 'download': return 'Downloaded'
      case 'qr_scan': return 'QR Scanned'
      default: return type
    }
  }

  const getDeviceType = (ua: string | null) => {
    if (!ua) return 'Unknown'
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
    if (/Android/i.test(ua)) return 'Android'
    if (/Windows/i.test(ua)) return 'Windows'
    if (/Mac/i.test(ua)) return 'Mac'
    return 'Other'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading analytics...</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Analytics Not Found</h1>
          <p className="text-muted mb-6">{error}</p>
          <Link to="/" className="text-accent hover:underline">
            ← Back to vCard Creator
          </Link>
        </div>
      </div>
    )
  }

  const shareUrl = `${window.location.origin}/c/${stats.shortcode}`

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Creator
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {stats.first_name} {stats.last_name}
          </h1>
          {stats.organization && (
            <p className="text-muted">{stats.organization}</p>
          )}
          <p className="text-sm text-muted mt-2">
            Created {formatDate(stats.created_at)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface backdrop-blur-xl rounded-2xl border border-outline p-6">
            <div className="flex items-center gap-2 text-muted mb-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">Page Views</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.page_views}</p>
          </div>

          <div className="bg-surface backdrop-blur-xl rounded-2xl border border-outline p-6">
            <div className="flex items-center gap-2 text-muted mb-2">
              <MousePointerClick className="w-5 h-5" />
              <span className="text-sm">Save Clicks</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.save_clicks}</p>
          </div>

          <div className="bg-surface backdrop-blur-xl rounded-2xl border border-outline p-6">
            <div className="flex items-center gap-2 text-muted mb-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Downloads</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.downloads}</p>
          </div>

          <div className="bg-surface backdrop-blur-xl rounded-2xl border border-outline p-6">
            <div className="flex items-center gap-2 text-muted mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Conversion</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.conversion_rate}%</p>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-surface backdrop-blur-xl rounded-2xl border border-outline p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-3">Share Link</h2>
          <div className="flex gap-2">
            <div className="flex-1 bg-panel rounded-lg px-4 py-3 text-foreground font-mono text-sm truncate">
              {shareUrl}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="px-4 py-3 rounded-lg bg-[#7393CC] text-foreground font-medium hover:bg-[#7393CC]/80 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface backdrop-blur-xl rounded-2xl border border-outline p-6">
          <h2 className="font-semibold text-foreground mb-4">Recent Activity</h2>
          
          {recentEvents.length === 0 ? (
            <p className="text-muted text-center py-8">
              No activity yet. Share your link to start tracking!
            </p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-surface rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.event_type)}
                    <div>
                      <p className="text-foreground text-sm">{getEventLabel(event.event_type)}</p>
                      <p className="text-muted text-xs">{getDeviceType(event.user_agent)}</p>
                    </div>
                  </div>
                  <p className="text-muted text-sm">
                    {formatDate(event.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="text-center mt-8">
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
