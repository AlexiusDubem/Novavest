'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { OnboardingGuide } from '@/components/dashboard/OnboardingGuide'
import { SessionLock } from '@/components/dashboard/SessionLock'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { signOutUser } from '@/lib/firebase/auth'
import { subscribeToNotifications, markNotificationRead } from '@/lib/firebase/firestore'
import { formatDateTime } from '@/lib/formatters'
import type { NotificationRecord } from '@/lib/firebase/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faWallet,
  faSearch,
  faBell,
  faCircleUser,
  faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionUnlocked, setSessionUnlocked] = useState(true)
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedPin = localStorage.getItem('girdup-dashboard-pin')
    const unlocked = storedPin ? sessionStorage.getItem('girdup-dashboard-unlocked') === 'true' : true
    setSessionUnlocked(unlocked)
  }, [])

  useEffect(() => {
    if (!loading && !user && pathname.startsWith('/dashboard')) {
      router.replace('/login')
    }
  }, [loading, pathname, router, user])

  useEffect(() => {
    if (profile?.accountStatus === 'suspended' && pathname !== '/dashboard/support') {
      router.replace('/dashboard/support')
    }
  }, [pathname, profile?.accountStatus, router])

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToNotifications(user.uid, (notifications) => {
      setNotifications(notifications)
    })
    return unsubscribe
  }, [user])

  async function handleSignOut() {
    await signOutUser()
    router.push('/login')
  }

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-600">
        <div className="flex flex-col items-center gap-4 text-center">
           <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Securing Session...</p>
        </div>
      </div>
    )
  }

  if (!sessionUnlocked) {
    return <SessionLock onAuthenticated={() => setSessionUnlocked(true)} />
  }

  const isSuspended = profile.accountStatus === 'suspended'

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-foreground selection:bg-primary/10">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[290px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-5 lg:px-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen((value) => !value)}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm lg:hidden transition active:scale-95"
              >
                <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
              </button>

              <Link
                href="/dashboard/deposit"
                className="group inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-50 sm:px-6 shadow-sm active:scale-95"
              >
                <FontAwesomeIcon icon={faWallet} className="text-emerald-500" />
                <span className="hidden sm:inline">Fund Terminal</span>
              </Link>
            </div>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-500 shadow-inner md:flex md:min-w-[240px] md:max-w-md md:flex-1">
              <FontAwesomeIcon icon={faSearch} className="h-3 w-3" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-transparent text-xs font-bold outline-none placeholder:text-slate-400 w-full"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button
                  className={`relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:bg-slate-50 active:scale-95 ${showNotifications ? 'ring-2 ring-primary/20 bg-slate-50' : ''}`}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg ring-2 ring-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-4 w-[calc(100vw-32px)] max-w-[340px] rounded-[32px] border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 sm:w-80 transition-all animate-in fade-in slide-in-from-top-2">
                    <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Intelligence Brief</h3>
                      <span className="text-[9px] font-black uppercase bg-slate-950 text-white px-2 py-0.5 rounded-full">{notifications.length}</span>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 italic text-[11px] font-bold">No data alerts detected in this cycle.</div>
                      ) : (
                        notifications.map(notification => (
                          <div key={notification.id} className={`p-5 border-b border-slate-50 last:border-b-0 transition ${!notification.read ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-xs text-slate-900 uppercase tracking-tight">{notification.title}</p>
                                <p className="text-[11px] font-bold text-slate-500 mt-1.5 leading-relaxed">{notification.message}</p>
                              </div>
                              {!notification.read && (
                                <button
                                  onClick={() => markNotificationRead(notification.id)}
                                  className="flex-shrink-0 h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 transition hover:bg-emerald-500 hover:text-white"
                                >
                                  <FontAwesomeIcon icon={faSearch} className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/dashboard/profile"
                className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:bg-slate-50 active:scale-95"
              >
                <FontAwesomeIcon icon={faCircleUser} className="h-4 w-4" />
              </Link>

              <button
                className="hidden rounded-2xl border border-slate-200 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 sm:block active:scale-95"
                onClick={handleSignOut}
              >
                Disconnect
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-10">
          {isSuspended && pathname !== '/dashboard/support' ? (
            <div className="mx-auto max-w-3xl rounded-[40px] border border-rose-200 bg-rose-50/50 p-10 text-rose-950 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-14 w-14 rounded-[20px] bg-rose-500 flex items-center justify-center text-white shadow-xl">
                    <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tighter">Terminal Suspended</h2>
              </div>
              <p className="text-base font-bold leading-relaxed opacity-80">
                Your institutional access has been restricted by GIRDUP security. Support is still accessible for appeal.
                <br /><br />
                <span className="text-[11px] font-black uppercase tracking-widest text-rose-500">REASON: {profile.suspensionReason || 'Direct restriction / Pending Review'}</span>
              </p>
              <Button className="mt-8 h-12 rounded-2xl bg-slate-950 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl" onClick={() => router.push('/dashboard/support')}>
                Establish Support Link
              </Button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
      <OnboardingGuide />
    </div>
  )
}
