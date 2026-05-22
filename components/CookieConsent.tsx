'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Delay showing the banner slightly for better visual feedback
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function handleReject() {
    localStorage.setItem('cookie-consent', 'rejected')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed bottom-6 left-6 right-6 z-50 mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-500/5 backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden rounded-2xl bg-cyan-500/10 p-3 text-cyan-400 sm:block">
                <Cookie className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Cookie Preferences
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  We use cookies to optimize our institutional-grade investor platform, personalize live portfolio tracking, and analyze security telemetry. By continuing or clicking 'Accept', you agree to our cookie policy.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleReject}
                className="w-full sm:w-auto rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors hover:bg-white/5"
              >
                Reject Essential Only
              </button>
              <Button
                onClick={handleAccept}
                size="lg"
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 font-bold uppercase tracking-wider text-slate-950 hover:from-cyan-400 hover:to-teal-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                Accept All Cookies
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
