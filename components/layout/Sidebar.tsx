'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine,
  faCog,
  faCoins,
  faHeadset,
  faHistory,
  faMinus,
  faPlus,
  faRocket,
  faTimes,
  faUser,
  faUserCheck,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { Shield } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuth } from '@/hooks/use-auth'
import { DASHBOARD_NAV_ITEMS } from '@/lib/constants'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin, profile } = useAuth()

  const iconMap: Record<string, React.ReactNode> = {
    faChartLine: <FontAwesomeIcon icon={faChartLine} className="text-base" />,
    faWallet: <FontAwesomeIcon icon={faWallet} className="text-base" />,
    faHistory: <FontAwesomeIcon icon={faHistory} className="text-base" />,
    faCoins: <FontAwesomeIcon icon={faCoins} className="text-base" />,
    faCog: <FontAwesomeIcon icon={faCog} className="text-base" />,
    faHeadset: <FontAwesomeIcon icon={faHeadset} className="text-base" />,
    faUser: <FontAwesomeIcon icon={faUser} className="text-base" />,
    faUserCheck: <FontAwesomeIcon icon={faUserCheck} className="text-base" />,
    faPlus: <FontAwesomeIcon icon={faPlus} className="text-base" />,
    faMinus: <FontAwesomeIcon icon={faMinus} className="text-base" />,
    faRocket: <FontAwesomeIcon icon={faRocket} className="text-base" />,
  }

  const navItems = isAdmin
    ? [...DASHBOARD_NAV_ITEMS, { label: 'Control Center', href: '/control', icon: 'admin' }]
    : DASHBOARD_NAV_ITEMS
  const filteredNavItems = profile?.accountStatus === 'suspended'
    ? navItems.filter((item) => item.href === '/dashboard/support')
    : navItems

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col border-r border-slate-200 bg-white text-slate-900 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-7">
          <BrandLogo href="/dashboard" subtitle="Investor OS" />
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="mx-4 rounded-[28px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm ring-1 ring-slate-100/50">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Verified Portfolio ID</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="break-all text-2xl font-bold tracking-tighter text-slate-900 leading-none">{profile?.portfolioId ?? 'NV-404'}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-widest text-primary/80">{profile?.investmentPackage ?? 'Threshold Active'}</p>
            </div>
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-slate-400'}>
                  {item.icon === 'admin' ? <Shield className="h-4 w-4" /> : iconMap[item.icon] ?? null}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 px-6 py-5 text-sm leading-6 text-slate-500">
          <p className="break-words">
            NovaVest dashboard for funding, live market tracking, trading flows, and portfolio monitoring.
          </p>
        </div>
      </aside>
    </>
  )
}
