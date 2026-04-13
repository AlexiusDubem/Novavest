'use client'

import { MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-12 w-[124px] rounded-full border border-border/70 bg-card/70" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-card/80 px-3 py-2 shadow-sm backdrop-blur">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-100 text-amber-600'
        }`}
      >
        {isDark ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </div>
      <div className="leading-none">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Theme</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{isDark ? 'Dark' : 'Light'} mode</p>
      </div>
      <Switch checked={isDark} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} className="h-7 w-12" />
    </div>
  )
}
