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
  faShieldHalved,
  faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons'
import { Shield } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuth } from '@/hooks/use-auth'
import { DASHBOARD_NAV_ITEMS } from '@/lib/constants'
import { signOutUser } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, profile } = useAuth()

  const iconMap: Record<string, React.ReactNode> = {
    faChartLine: <FontAwesomeIcon icon={faChartLine} className="h-4 w-4" />,
    faWallet: <FontAwesomeIcon icon={faWallet} className="h-4 w-4" />,
    faHistory: <FontAwesomeIcon icon={faHistory} className="h-4 w-4" />,
    faCoins: <FontAwesomeIcon icon={faCoins} className="h-4 w-4" />,
    faCog: <FontAwesomeIcon icon={faCog} className="h-4 w-4" />,
    faHeadset: <FontAwesomeIcon icon={faHeadset} className="h-4 w-4" />,
    faUser: <FontAwesomeIcon icon={faUser} className="h-4 w-4" />,
    faUserCheck: <FontAwesomeIcon icon={faUserCheck} className="h-4 w-4" />,
    faPlus: <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />,
    faMinus: <FontAwesomeIcon icon={faMinus} className="h-4 w-4" />,
    faRocket: <FontAwesomeIcon icon={faRocket} className="h-4 w-4" />,
    faShieldHalved: <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />,
  }

  const navItems = isAdmin
    ? [...DASHBOARD_NAV_ITEMS, { label: 'Control Center', href: '/control', icon: 'faShieldHalved' }]
    : DASHBOARD_NAV_ITEMS
  const filteredNavItems = profile?.accountStatus === 'suspended'
    ? navItems.filter((item) => item.href === '/dashboard/support')
    : navItems

  const handleSignOut = async () => {
    await signOutUser()
    router.push('/login')
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-md lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col border-r border-slate-200 bg-white text-slate-900 transition-all duration-500 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full shadow-none'
        } ${open ? 'shadow-[20px_0_60px_rgba(0,0,0,0.1)]' : ''}`}
      >
        <div className="flex items-center justify-between px-7 py-8">
          <BrandLogo href="/dashboard" subtitle="Institutional" />
          <button onClick={onClose} className="rounded-2xl p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 lg:hidden transition-all">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="mx-5 mb-4 rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm overflow-hidden relative group transition-shadow hover:shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-all" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Secured ID</p>
          <div className="flex items-center justify-between relative z-10">
            <div className="min-w-0">
              <p className="break-all text-2xl font-black tracking-tighter text-slate-900 leading-none">{profile?.portfolioId ?? 'NV-000'}</p>
              <div className="mt-3 flex items-center gap-2">
                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/80">{profile?.investmentPackage ?? 'Active Mandate'}</p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600">
               <FontAwesomeIcon icon={faUserCheck} />
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 no-scrollbar">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3.5 rounded-2xl px-5 py-4 text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <span className={`transition-transform duration-300 ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-400 group-hover:text-slate-950'}`}>
                  {iconMap[item.icon] ?? null}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-100 px-4 py-6 space-y-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3.5 rounded-2xl px-5 py-4 text-[13px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="h-4 w-4" />
            Sign Out
          </button>
          
          <div className="flex items-center gap-3 px-4 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all">
             <div className="h-2 w-2 rounded-full bg-emerald-500" />
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Live Pulse Node 2.1</p>
          </div>
        </div>
      </aside>
    </>
  )
}
