import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme !== 'light')

  function toggleTheme() {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.documentElement.style.colorScheme = next
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#1a1c3d' : '#f4f6fb')
    setDark(!dark)
    try {
      localStorage.setItem('vcard-theme', next)
    } catch {
      // The switch still works when browser storage is unavailable.
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end">
      <button type="button" role="switch" aria-label="Dark mode" aria-checked={dark} onClick={toggleTheme}
        className="inline-flex items-center gap-2 rounded-full border border-outline bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
        {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        {dark ? 'Dark mode' : 'Light mode'}
        <span aria-hidden="true" className={`flex items-center w-9 h-5 rounded-full p-0.5 ${dark ? 'bg-[#7393CC]' : 'bg-slate-300'}`}>
          <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-4' : ''}`} />
        </span>
      </button>
    </div>
  )
}
