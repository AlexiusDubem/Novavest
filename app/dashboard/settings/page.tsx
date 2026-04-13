'use client'

import { useEffect, useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Bell, Lock, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { fireAlert } from '@/lib/alerts'
import { markOnboardingComplete, saveSettings } from '@/lib/firebase/firestore'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(profile?.notifications.email ?? true)
  const [smsNotifications, setSmsNotifications] = useState(profile?.notifications.sms ?? false)

  useEffect(() => {
    setEmailNotifications(profile?.notifications.email ?? true)
    setSmsNotifications(profile?.notifications.sms ?? false)
  }, [profile?.notifications.email, profile?.notifications.sms])

  async function handleSavePreferences() {
    if (!user) return

    try {
      setSaving(true)
      await saveSettings(user.uid, { email: emailNotifications, sms: smsNotifications })
    } catch (error) {
      await fireAlert({
        title: 'Unable to save settings',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordReset() {
    if (!profile?.email) return
    await sendPasswordResetEmail(getFirebaseAuth(), profile.email)
    await fireAlert({
      title: 'Reset email sent',
      text: `A password reset email has been sent to ${profile.email}.`,
      icon: 'success',
      confirmButtonText: 'Done',
    })
  }

  async function handleFinishOnboarding() {
    if (!user) return
    await markOnboardingComplete(user.uid)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">Password reset</p>
            <p className="mt-1 text-sm text-gray-600">Send a secure password reset email to the address on file.</p>
          </div>
          <Button variant="outline" onClick={handlePasswordReset}>
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={20} />
            Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">Current onboarding state: {profile?.onboardingCompleted ? 'Completed' : 'Pending'}</p>
          <Button variant="outline" onClick={handleFinishOnboarding}>
            Mark Onboarding Complete
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
