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

  return (
    <Link href={href} className={`flex items-center gap-3 ${className}`.trim()}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center object-contain overflow-visible p-0.5">
         <img src="/icon.svg" alt="BoldWave Logo" className="h-full w-full object-contain" />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className={`text-2xl font-black tracking-tight ${textPrimary}`}>BOLDWAVE</p>
          <p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.32em] ${textSecondary}`}>{subtitle}</p>
        </div>
      )}
    </Link>
  )
}
