'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { formatDate } from '@/lib/formatters'
import { createKycSubmission, subscribeToKycSubmissions } from '@/lib/firebase/firestore'
import type { KycSubmission } from '@/lib/firebase/types'

const KYC_STAGES = {
  US: [
    { label: 'Personal Information', fields: ['fullName', 'dateOfBirth', 'ssn'] },
    { label: 'Address Verification', fields: ['addressLine', 'city', 'state', 'zipCode'] },
    { label: 'Document Upload', fields: ['documentType', 'documentNumber'] },
  ],
  default: [
    { label: 'Personal Information', fields: ['fullName', 'dateOfBirth'] },
    { label: 'Address Information', fields: ['addressLine', 'city', 'country'] },
    { label: 'Identity Document', fields: ['documentType', 'documentNumber'] },
  ],
}

interface FormData {
  fullName: string
  dateOfBirth: string
  ssn: string
  addressLine: string
  city: string
  state: string
  zipCode: string
  country: string
  documentType: string
  documentNumber: string
}

export default function KYCPage() {
  const { user, profile } = useAuth()
  const [submissions, setSubmissions] = useState<KycSubmission[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<FormData>>({})

  const stages = profile?.country ? (KYC_STAGES[profile.country as keyof typeof KYC_STAGES] || KYC_STAGES.default) : KYC_STAGES.default

  useEffect(() => {
    if (!user) return
    return subscribeToKycSubmissions(user.uid, setSubmissions)
  }, [user])

  function getFieldConfig(field: string) {
    const configs: Record<string, { label: string, type: string, placeholder: string }> = {
      fullName: { label: 'Full Name', type: 'text', placeholder: 'Enter your full legal name' },
      dateOfBirth: { label: 'Date of Birth', type: 'date', placeholder: '' },
      ssn: { label: 'Social Security Number', type: 'text', placeholder: 'XXX-XX-XXXX' },
      addressLine: { label: 'Address', type: 'text', placeholder: 'Street address' },
      city: { label: 'City', type: 'text', placeholder: 'City name' },
      state: { label: 'State', type: 'text', placeholder: 'State' },
      zipCode: { label: 'ZIP Code', type: 'text', placeholder: 'ZIP code' },
      country: { label: 'Country', type: 'text', placeholder: 'Country' },
      documentType: { label: 'Document Type', type: 'text', placeholder: 'Passport, License, National ID' },
      documentNumber: { label: 'Document Number', type: 'text', placeholder: 'Document number' },
    }
    return configs[field] || { label: field, type: 'text', placeholder: '' }
  }

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleNextStep() {
    const stage = stages[currentStep]
    
    // Validate all fields in current stage are filled
    for (const field of stage.fields) {
      if (!formData[field as keyof FormData]?.trim()) {
        await fireAlert({
          title: 'Complete all fields',
          text: `Please fill in ${getFieldConfig(field).label}`,
          icon: 'warning',
          confirmButtonText: 'OK',
        })
        return
      }
    }

    if (currentStep < stages.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final submission
      await handleSubmitKYC()
    }
  }

  async function handleSubmitKYC() {
    if (!user) return

    try {
      setSubmitting(true)
      const kycPayload: any = {
        level: 1,
        country: profile?.country || 'Unknown',
      }

      // Add all filled fields
      if (formData.fullName) kycPayload.fullName = formData.fullName
      if (formData.dateOfBirth) kycPayload.dateOfBirth = formData.dateOfBirth
      if (formData.ssn) kycPayload.ssn = formData.ssn
      if (formData.addressLine) kycPayload.addressLine = formData.addressLine
      if (formData.city) kycPayload.city = formData.city
      if (formData.state) kycPayload.state = formData.state
      if (formData.zipCode) kycPayload.zipCode = formData.zipCode
      if (formData.documentType) kycPayload.documentType = formData.documentType
      if (formData.documentNumber) kycPayload.documentNumber = formData.documentNumber

      await createKycSubmission(user.uid, kycPayload)
      
      await fireAlert({
        title: 'KYC submitted successfully',
        text: 'Your verification request has been submitted. You will be notified once reviewed.',
        icon: 'success',
        confirmButtonText: 'OK',
      })

      // Reset form
      setFormData({})
      setCurrentStep(0)
      setIsFormOpen(false)
    } catch (error) {
      await fireAlert({
        title: 'Unable to submit KYC',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handlePreviousStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  function handleCancel() {
    setIsFormOpen(false)
    setCurrentStep(0)
    setFormData({})
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">Know Your Customer (KYC)</h1>
        <p className="text-gray-600">Submit your verification details for BOLDWAVE review before funding and investing begin.</p>
      </div>

      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle>Your Current Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm text-gray-600">Verification Level</p>
            <p className="mt-1 text-2xl font-bold text-secondary">Level {profile?.kycLevel ?? 0}</p>
            <p className="mt-2 text-sm capitalize text-gray-600">Status: {profile?.kycStatus?.replace('_', ' ')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Latest submission</p>
            <p className="mt-1 text-sm text-gray-900">{submissions[0] ? formatDate(submissions[0].createdAt) : 'None yet'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why KYC is required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Before you can invest, we need a verified identity and proof of residence. This is standard for regulated investment platforms.
          </p>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <strong>Proof of identity</strong>: passport, driver license or national ID.
            </li>
            <li className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <strong>Proof of address</strong>: recent utility bill, bank statement or government letter.
            </li>
            <li className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <strong>Source of funds</strong>: details about where your investment deposit is coming from.
            </li>
            <li className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <strong>Account safety</strong>: complete KYC to unlock deposits, withdrawals, and investment requests.
            </li>
          </ul>
        </CardContent>
      </Card>

      {!isFormOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>Start KYC Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Click below to begin the verification process. The form will guide you through the required steps ({stages.length} steps) based on your country.
            </p>
            <Button onClick={() => setIsFormOpen(true)} disabled={submitting} className="w-full bg-primary text-white hover:bg-primary/90">
              Start KYC Verification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Verification Form - Step {currentStep + 1} of {stages.length}</CardTitle>
                <p className="mt-1 text-sm text-gray-600">{stages[currentStep]?.label}</p>
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / stages.length) * 100)}%
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {stages[currentStep]?.fields.map((field) => {
                const config = getFieldConfig(field)
                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {config.label}
                    </label>
                    <Input
                      type={config.type}
                      placeholder={config.placeholder}
                      value={formData[field as keyof FormData] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full"
                    />
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={handlePreviousStep}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNextStep}
                className={`flex-1 bg-primary text-white hover:bg-primary/90`}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : currentStep === stages.length - 1 ? 'Submit Verification' : 'Next Step'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Level {submission.level} verification</p>
                  <p className="text-sm text-gray-600">{submission.documentType} ending {submission.documentNumber?.slice(-4)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${submission.status === 'approved' ? 'bg-green-100 text-green-800' : submission.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {submission.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                {submission.status === 'approved' ? <Check size={16} /> : <Clock size={16} />}
                Submitted {formatDate(submission.createdAt)}
              </div>
            </div>
          ))}
          {submissions.length === 0 && <p className="text-sm text-muted-foreground">No verification requests submitted yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
