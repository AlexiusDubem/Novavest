'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, CheckCircle, ShieldAlert, LogOut, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { deactivateAccount, deleteUserAccount, updateUserProfile } from '@/lib/firebase/firestore'
import { signOutUser } from '@/lib/firebase/auth'
import { fireAlert } from '@/lib/alerts'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    country: profile?.country ?? '',
  })

  useEffect(() => {
    setFormData({
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      country: profile?.country ?? '',
    })
  }, [profile?.country, profile?.email, profile?.firstName, profile?.lastName, profile?.phone])

  async function handleSave() {
    if (!user) return

    try {
      setSaving(true)
      await updateUserProfile(user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
      })
      setIsEditing(false)
    } catch (error) {
      await fireAlert({
        title: 'Unable to update profile',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-primary">Your Profile</h1>
          <p className="text-gray-600">Manage your account profile and contact details.</p>
        </div>
        <Button onClick={() => setIsEditing((value) => !value)} className="bg-primary text-white hover:bg-primary/90">
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Card className="border-2 border-secondary">
        <CardContent className="pt-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-4xl font-bold text-white">
              {(profile?.firstName?.[0] ?? 'N')}{(profile?.lastName?.[0] ?? 'V')}
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-2xl font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</p>
              <div className="mt-2 flex flex-col gap-4 text-sm text-gray-600 md:flex-row">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={18} />
                  <span>KYC Level {profile?.kycLevel ?? 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span>Portfolio {profile?.portfolioId}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
              <Input value={formData.firstName} disabled={!isEditing} onChange={(event) => setFormData({ ...formData, firstName: event.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
              <Input value={formData.lastName} disabled={!isEditing} onChange={(event) => setFormData({ ...formData, lastName: event.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail size={16} />
                Email Address
              </label>
              <Input value={formData.email} disabled />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone size={16} />
                Phone Number
              </label>
              <Input value={formData.phone} disabled={!isEditing} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
            <Input value={formData.country} disabled={!isEditing} onChange={(event) => setFormData({ ...formData, country: event.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-rose-100 bg-rose-50/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-900">
            <ShieldAlert size={20} />
            Security & Identity Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col justify-between gap-4 border-b border-rose-100 pb-6 md:flex-row md:items-center">
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Deactivate Mandatory Monitoring</p>
              <p className="text-xs font-medium text-slate-500">Temporarily suspend all ROI accruals and session activity.</p>
            </div>
            <Button 
              variant="outline" 
              className="border-rose-200 text-rose-700 hover:bg-rose-100"
              onClick={async () => {
                const confirmed = await fireAlert({
                  title: 'Deactivate Mandate?',
                  text: 'This will flag your account for administrative review and lock current sessions.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, Deactivate',
                  confirmButtonColor: '#be123c'
                })
                if (confirmed.isConfirmed && user) {
                  await deactivateAccount(user.uid)
                  await signOutUser()
                  window.location.href = '/'
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Deactivate
            </Button>
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Terminate Workspace Data</p>
              <p className="text-xs font-medium text-slate-500">Permanently erase all mandate history and principal records from the database.</p>
            </div>
            <Button 
              variant="destructive"
              onClick={async () => {
                const result = await fireAlert({
                  title: 'Final Warning',
                  text: 'This action is irreversible. All portfolio data will be purged immediately.',
                  icon: 'error',
                  showCancelButton: true,
                  confirmButtonText: 'Purge Everywhere',
                  confirmButtonColor: '#e11d48'
                })

                if (result.isConfirmed && user) {
                   await deleteUserAccount(user.uid)
                   await signOutUser()
                   window.location.href = '/'
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Terminate Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-white hover:bg-primary/90" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  )
}
