'use client'

import Link from 'next/link'

interface BrandLogoProps {
  href?: string
  compact?: boolean
  light?: boolean
  subtitle?: string
  className?: string
}

export function BrandLogo({
  href = '/',
  compact = false,
  light = false,
  subtitle = 'Investor Platform',
  className = '',
}: BrandLogoProps) {
  const textPrimary = light ? 'text-white' : 'text-slate-950'
  const textSecondary = light ? 'text-cyan-200' : 'text-slate-500'
  const chipBg = light ? 'border-white/15 bg-white/10' : 'border-slate-200 bg-white'
  const chipAccent = light ? 'text-cyan-200' : 'text-primary'

  return (
    <Link href={href} className={`flex items-center gap-3 ${className}`.trim()}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${chipBg}`}>
        <div className={`grid grid-cols-2 gap-1.5 ${chipAccent}`}>
          <span className="h-2.5 w-2.5 rounded-[4px] border border-current" />
          <span className="h-2.5 w-2.5 rounded-[4px] border border-current" />
          <span className="h-2.5 w-2.5 rounded-[4px] border border-current" />
          <span className="h-2.5 w-2.5 rounded-[4px] border border-current" />
        </div>
      </div>
      {!compact && (
        <div className="leading-none">
          <p className={`text-2xl font-semibold tracking-tight ${textPrimary}`}>GIRDUP</p>
          <p className={`mt-1 text-[11px] uppercase tracking-[0.32em] ${textSecondary}`}>{subtitle}</p>
        </div>
      )}
    </Link>
  )
}
