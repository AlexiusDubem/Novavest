'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Shield, X } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS } from '@/lib/constants'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" light subtitle="Investor Platform" />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative text-sm font-semibold text-slate-300 transition-colors hover:text-teal-400 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-teal-400 after:to-cyan-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Button asChild variant="ghost" className="rounded-full px-5 text-slate-300 hover:text-white hover:bg-white/5">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-5 text-white font-semibold shadow-lg shadow-teal-500/15">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-full border border-teal-500/20 bg-teal-500/10 px-5 text-teal-300 hover:bg-teal-500/20 hover:text-teal-200"
          >
            <Link href="/dashboard">
              <Shield className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <button
          onClick={() => setIsOpen((value) => !value)}
          className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/5 lg:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/5 bg-slate-950/95 px-4 py-4 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-teal-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2">
              <Button asChild variant="ghost" className="rounded-full text-slate-300 hover:text-white border border-white/10">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold">
                <Link href="/signup">Sign Up</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-300">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
