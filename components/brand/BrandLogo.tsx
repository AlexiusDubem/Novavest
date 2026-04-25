'use client'

import Link from 'next/link'
import Image from 'next/image'

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
  const textSecondary = light ? 'text-cyan-200' : 'text-slate-500'

  return (
    <Link href={href} className={`flex items-center gap-3 ${className}`.trim()}>
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden p-0.5">
          <Image 
            src="/logo.png" 
            alt="BOLDWAVE" 
            fill 
            className="object-contain" 
            priority
            unoptimized
          />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="flex text-2xl font-black tracking-tighter">
            <span className={light ? 'text-white' : 'text-slate-950'}>BOLD</span>
            <span className={light ? 'text-cyan-300' : 'text-cyan-600'}>WAVE</span>
          </p>
          <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.4em] ${textSecondary}`}>{subtitle}</p>
        </div>
      )}
    </Link>
  )
}
