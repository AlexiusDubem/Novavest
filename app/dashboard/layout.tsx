'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Menu, Search, UserCircle2, Wallet2 } from 'lucide-react'
import { OnboardingGuide } from '@/components/dashboard/OnboardingGuide'
import { SessionLock } from '@/components/dashboard/SessionLock'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { signOutUser } from '@/lib/firebase/auth'
import { subscribeToNotifications, markNotificationRead } from '@/lib/firebase/firestore'
import type { NotificationRecord } from '@/lib/firebase/types'

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
    const storedPin = localStorage.getItem('novainvest-dashboard-pin')
    const unlocked = storedPin ? sessionStorage.getItem('novainvest-dashboard-unlocked') === 'true' : true
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
    console.log('Setting up notification subscription for user:', user.uid)
    const unsubscribe = subscribeToNotifications(user.uid, (notifications) => {
      console.log('Received notifications:', notifications.length, notifications)
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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fd] px-6 text-slate-600">
        Loading your secured dashboard...
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
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8 shadow-sm ring-1 ring-slate-100/50">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen((value) => !value)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 shadow-sm lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link
                href="/dashboard/deposit"
                className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary sm:px-5 sm:py-3 sm:text-slate-900 sm:hover:text-white"
              >
                <Wallet2 className="h-4 w-4" />
                <span className="hidden sm:inline">Fund Wallet</span>
              </Link>
            </div>

            <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-500 shadow-sm md:flex md:min-w-[220px] md:flex-1">
              <Search className="h-4 w-4" />
              <span className="truncate text-sm font-medium">
                {profile.firstName} workspace
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button
                  className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:bg-slate-50 sm:p-3"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-3 w-[calc(100vw-32px)] max-w-[320px] rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 sm:w-80">
                    <div className="bg-slate-50/50 p-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Notifications</h3>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 italic text-sm">No notification data available.</div>
                      ) : (
                        notifications.map(notification => (
                          <div key={notification.id} className={`p-4 border-b border-slate-50 last:border-b-0 transition ${!notification.read ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">{notification.title}</p>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{notification.message}</p>
                              </div>
                              {!notification.read && (
                                <button
                                  onClick={() => markNotificationRead(notification.id)}
                                  className="flex-shrink-0 text-[10px] font-bold uppercase text-primary tracking-tighter hover:underline"
                                >
                                  Read
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
                className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:bg-slate-50 sm:p-3"
              >
                <UserCircle2 className="h-5 w-5" />
              </Link>

              <button
                className="hidden rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:block"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-8">
          {isSuspended && pathname !== '/dashboard/support' ? (
            <div className="mx-auto max-w-3xl rounded-[28px] border border-amber-200 bg-amber-50 p-8 text-amber-950">
              <h2 className="text-2xl font-semibold">Account Suspended</h2>
              <p className="mt-3 leading-7">
                Your account is currently suspended. Support is still available. Reason: {profile.suspensionReason || 'Contact support for more information.'}
              </p>
              <Button className="mt-6" onClick={() => router.push('/dashboard/support')}>
                Open Support
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
