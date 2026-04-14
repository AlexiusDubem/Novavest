'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fireAlert } from '@/lib/alerts'

const PIN_STORAGE_KEY = 'girdup-dashboard-pin'
const SESSION_UNLOCK_KEY = 'girdup-dashboard-unlocked'

export function SessionLock({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [storedPin, setStoredPin] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedPin = localStorage.getItem(PIN_STORAGE_KEY)
    setStoredPin(savedPin)

    if (savedPin && sessionStorage.getItem(SESSION_UNLOCK_KEY) === 'true') {
      onAuthenticated()
    }
  }, [onAuthenticated])

  async function handleUnlock() {
    if (!storedPin) return
    if (pin !== storedPin) {
      setError('Incorrect PIN. Try again.')
      return
    }

    sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true')
    onAuthenticated()
  }

  async function handleSetup() {
    if (pin.length !== 4 || confirmPin.length !== 4) {
      setError('PIN must be 4 digits.')
      return
    }

    if (pin !== confirmPin) {
      setError('PIN entries do not match.')
      return
    }

    if (typeof window === 'undefined') return
    localStorage.setItem(PIN_STORAGE_KEY, pin)
    sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true')
    await fireAlert({
      title: 'PIN set successfully',
      text: 'Your dashboard will now lock on return visits until you enter this PIN.',
      icon: 'success',
      confirmButtonText: 'Continue',
    })
    onAuthenticated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-700 bg-slate-900/95 p-8 text-white shadow-2xl shadow-black/40">
        <h2 className="text-3xl font-semibold">GIRDUP Secure Lock</h2>
        <p className="mt-3 text-sm text-slate-400">
          {storedPin
            ? 'Enter your 4-digit dashboard PIN to continue.'
            : 'Set a 4-digit dashboard PIN. You will need it whenever you return to the app.'}
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300">4-digit PIN</label>
            <Input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
              className="mt-2 text-center tracking-[0.5em]"
            />
          </div>

          {!storedPin && (
            <div>
              <label className="text-sm font-medium text-slate-300">Confirm PIN</label>
              <Input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, ''))}
                className="mt-2 text-center tracking-[0.5em]"
              />
            </div>
          )}

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex flex-col gap-3 pt-2">
            {storedPin ? (
              <Button onClick={handleUnlock} className="w-full bg-primary text-white hover:bg-primary/90">
                Unlock Dashboard
              </Button>
            ) : (
              <Button onClick={handleSetup} className="w-full bg-primary text-white hover:bg-primary/90">
                Set PIN and Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
