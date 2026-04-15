'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, AlertTriangle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

export default function ControlLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login')
      } else if (!isAdmin) {
        setShowError(true)
      }
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Verifying Authorization...</p>
        </div>
      </div>
    )
  }

  if (showError || (!loading && user && !isAdmin)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <div className="relative mb-8">
           <div className="absolute inset-0 animate-ping rounded-full bg-rose-500/10" />
           <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 border-4 border-white shadow-xl">
             <ShieldAlert className="h-12 w-12 text-rose-500" />
           </div>
        </div>
        
        <h1 className="text-8xl font-black tracking-tighter text-slate-900">404</h1>
        <p className="mt-4 text-2xl font-bold text-slate-900">Institutional Access Denied</p>
        <p className="mt-2 max-w-md text-slate-500">
          The requested gateway is restricted to authorized administrative personnel only. Your attempt has been logged for security audit purposes.
        </p>

        <div className="mt-10 flex flex-col gap-3 min-w-[240px]">
          <Button asChild className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-xs font-black uppercase tracking-widest text-white shadow-xl transition active:scale-95">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Return to Workspace
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => router.back()} className="h-14 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
            Go Back
          </Button>
        </div>

        <div className="mt-20 flex flex-col items-center gap-2 opacity-30">
           <div className="h-px w-32 bg-slate-200" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">BOLDWAVE Security Protocol 404</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
