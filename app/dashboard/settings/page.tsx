'use client'

import { useEffect, useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Bell, Lock, Sparkles, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { fireAlert } from '@/lib/alerts'
import { markOnboardingComplete, saveSettings } from '@/lib/firebase/firestore'

const PIN_KEY = 'BOLDWAVE-dashboard-pin'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(profile?.notifications.email ?? true)
  const [smsNotifications, setSmsNotifications] = useState(profile?.notifications.sms ?? false)

  // PIN state
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [currentPinExists, setCurrentPinExists] = useState(false)

  useEffect(() => {
    setEmailNotifications(profile?.notifications.email ?? true)
    setSmsNotifications(profile?.notifications.sms ?? false)
  }, [profile?.notifications.email, profile?.notifications.sms])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPinExists(!!localStorage.getItem(PIN_KEY))
    }
  }, [])

  async function handleSavePreferences() {
    if (!user) return
    try {
      setSaving(true)
      await saveSettings(user.uid, { email: emailNotifications, sms: smsNotifications })
    } catch (error) {
      await fireAlert({ title: 'Unable to save settings', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'Retry' })
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordReset() {
    if (!profile?.email) return
    await sendPasswordResetEmail(getFirebaseAuth(), profile.email)
    await fireAlert({ title: 'Reset email sent', text: `A password reset email has been sent to ${profile.email}.`, icon: 'success', confirmButtonText: 'Done' })
  }

  async function handleFinishOnboarding() {
    if (!user) return
    await markOnboardingComplete(user.uid)
  }

  function handleSavePin() {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return fireAlert({ title: 'Invalid PIN', text: 'PIN must be exactly 4 digits.', icon: 'error', confirmButtonText: 'OK' })
    }
    if (newPin !== confirmPin) {
      return fireAlert({ title: 'PIN mismatch', text: 'The PINs you entered do not match.', icon: 'error', confirmButtonText: 'OK' })
    }
    localStorage.setItem(PIN_KEY, newPin)
    setCurrentPinExists(true)
    setNewPin('')
    setConfirmPin('')
    fireAlert({ title: 'PIN saved', text: 'Your 4-digit security PIN has been set. It will be required for withdrawals and session unlock.', icon: 'success', confirmButtonText: 'Done' })
  }

  function handleClearPin() {
    localStorage.removeItem(PIN_KEY)
    setCurrentPinExists(false)
    fireAlert({ title: 'PIN removed', text: 'Your security PIN has been cleared.', icon: 'info', confirmButtonText: 'OK' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security.</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell size={20} /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-semibold text-gray-900">Email notifications</p>
              <p className="text-sm text-gray-600">Receive approval, balance, and account activity emails.</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-semibold text-gray-900">SMS notifications</p>
              <p className="text-sm text-gray-600">Receive urgent account alerts by SMS.</p>
            </div>
            <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
          </div>
          <Button onClick={handleSavePreferences} className="bg-primary text-white hover:bg-primary/90" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>

      {/* Security PIN */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck size={20} /> Security PIN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Your 4-digit PIN is required to unlock the dashboard after inactivity and to confirm withdrawals.
            {currentPinExists ? ' A PIN is currently set.' : ' No PIN is currently set.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">New PIN</label>
              <Input
                type="password"
                maxLength={4}
                placeholder="4 digits"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="tracking-[0.4em] text-center"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm PIN</label>
              <Input
                type="password"
                maxLength={4}
                placeholder="4 digits"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="tracking-[0.4em] text-center"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleSavePin} className="bg-primary text-white hover:bg-primary/90" disabled={newPin.length !== 4 || confirmPin.length !== 4}>
              {currentPinExists ? 'Change PIN' : 'Set PIN'}
            </Button>
            {currentPinExists && (
              <Button variant="outline" onClick={handleClearPin} className="border-rose-200 text-rose-600 hover:bg-rose-50">
                Remove PIN
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock size={20} /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">Password reset</p>
            <p className="mt-1 text-sm text-gray-600">Send a secure password reset email to the address on file.</p>
          </div>
          <Button variant="outline" onClick={handlePasswordReset}>Send Password Reset Email</Button>
        </CardContent>
      </Card>

      {/* Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles size={20} /> Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">Current onboarding state: {profile?.onboardingCompleted ? 'Completed' : 'Pending'}</p>
          <Button variant="outline" onClick={handleFinishOnboarding}>Mark Onboarding Complete</Button>
        </CardContent>
      </Card>
    </div>
  )
}

