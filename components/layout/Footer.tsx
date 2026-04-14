import Link from 'next/link'
import { Globe2, ShieldCheck, TrendingUp } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.6fr_0.6fr_0.9fr]">
          <div>
            <BrandLogo href="/" light subtitle="Investor Platform" />
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Premium investment platform for market intelligence, portfolio visibility, and secure digital asset
              operations.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Company</h3>
            <div className="mt-5 grid gap-3 text-sm text-slate-400">
              <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-teal-400 transition-colors">Leadership</Link>
              <Link href="/blog" className="hover:text-teal-400 transition-colors">News</Link>
              <Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Legal</h3>
            <div className="mt-5 grid gap-3 text-sm text-slate-400">
              <Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-teal-400 transition-colors">Terms &amp; Conditions</Link>
              <Link href="/how-it-works" className="hover:text-teal-400 transition-colors">Platform Guide</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-4 w-4 text-teal-400" />
                </div>
                Institutional-grade account protection
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
                Curated opportunity tracking across sectors
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Globe2 className="h-4 w-4 text-cyan-400" />
                </div>
                Global market coverage and company updates
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/5 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 GIRDUP. All rights reserved.</p>
          <p>Built for investors who want clarity, speed, and confidence.</p>
        </div>
      </div>
    </footer>
  )
}
