'use client'

import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import {
  adjustUserBalance,
  createSupportedAsset,
  createUserNotification,
  deleteSupportedAsset,
  seedAdminCollectionsIfMissing,
  setDepositRequestStatus,
  setInvestmentRequestStatus,
  setKycSubmissionStatus,
  setLoanRequestStatus,
  setUserAccountStatus,
  setWithdrawalRequestStatus,
  subscribeToAllDeposits,
  subscribeToAllInvestmentRequests,
  subscribeToAllKycSubmissions,
  subscribeToAllLoans,
  subscribeToAllSupportedAssets,
  subscribeToAllUsers,
  subscribeToAllWithdrawals,
  updateSupportedAsset,
} from '@/lib/firebase/firestore'
import type {
  DepositRequest,
  InvestmentRequestRecord,
  KycSubmission,
  LoanRequest,
  SupportedAsset,
  UserProfile,
  WithdrawalRequest,
} from '@/lib/firebase/types'

type ReviewType = 'deposit' | 'withdrawal' | 'loan' | 'kyc' | 'investment'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [deposits, setDeposits] = useState<DepositRequest[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loans, setLoans] = useState<LoanRequest[]>([])
  const [kycItems, setKycItems] = useState<KycSubmission[]>([])
  const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequestRecord[]>([])
  const [assets, setAssets] = useState<SupportedAsset[]>([])
  const [assetForm, setAssetForm] = useState({
    symbol: '',
    name: '',
    network: '',
    address: '',
    note: '',
  })
  const [savingAsset, setSavingAsset] = useState(false)
  const [adjustUserId, setAdjustUserId] = useState('')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [notificationUserId, setNotificationUserId] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [sendToAllUsers, setSendToAllUsers] = useState(false)
  const [sendingNotification, setSendingNotification] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
    if (!loading && user && !isAdmin) router.replace('/dashboard')
  }, [isAdmin, loading, router, user])

  useEffect(() => {
    if (!user || !isAdmin) return

    seedAdminCollectionsIfMissing().catch(() => undefined)
    const stopUsers = subscribeToAllUsers(setUsers)
    const stopDeposits = subscribeToAllDeposits(setDeposits)
    const stopWithdrawals = subscribeToAllWithdrawals(setWithdrawals)
    const stopLoans = subscribeToAllLoans(setLoans)
    const stopKyc = subscribeToAllKycSubmissions(setKycItems)
    const stopInvestments = subscribeToAllInvestmentRequests(setInvestmentRequests)
    const stopAssets = subscribeToAllSupportedAssets(setAssets)

    return () => {
      stopUsers()
      stopDeposits()
      stopWithdrawals()
      stopLoans()
      stopKyc()
      stopInvestments()
      stopAssets()
    }
  }, [isAdmin, user])

  const pendingCounts = useMemo(() => ({
    deposits: deposits.filter((item) => item.status === 'pending').length,
    withdrawals: withdrawals.filter((item) => item.status === 'pending').length,
    loans: loans.filter((item) => item.status === 'pending').length,
    kyc: kycItems.filter((item) => item.status === 'pending').length,
    investments: investmentRequests.filter((item) => item.status === 'pending').length,
  }), [deposits, withdrawals, loans, kycItems, investmentRequests])

  async function review(type: ReviewType, requestId: string, status: 'approved' | 'rejected') {
    if (!user) return
    const note = status === 'rejected'
      ? window.prompt('Optional reason:') ?? ''
      : ''

    try {
      if (type === 'deposit') await setDepositRequestStatus(requestId, status, user.uid, note)
      if (type === 'withdrawal') await setWithdrawalRequestStatus(requestId, status, user.uid, note)
      if (type === 'loan') await setLoanRequestStatus(requestId, status, user.uid, note)
      if (type === 'kyc') await setKycSubmissionStatus(requestId, status, user.uid, note)
      if (type === 'investment') await setInvestmentRequestStatus(requestId, status, user.uid, note)
    } catch (error) {
      await fireAlert({
        title: 'Action failed',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    }
  }

  async function handleCreateAsset() {
    if (Object.values(assetForm).some((value) => !value)) {
      await fireAlert({
        title: 'Complete the asset form',
        text: 'Symbol, name, network, address, and note are all required.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    try {
      setSavingAsset(true)
      await createSupportedAsset(assetForm)
      setAssetForm({ symbol: '', name: '', network: '', address: '', note: '' })
      await fireAlert({
        title: 'Funding asset saved',
        text: 'The wallet method is now available in the live workspace.',
        icon: 'success',
        confirmButtonText: 'Done',
      })
    } catch (error) {
      await fireAlert({
        title: 'Unable to create asset',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setSavingAsset(false)
    }
  }

  async function handleRestoreCoreAssets() {
    try {
      await seedAdminCollectionsIfMissing()
      await fireAlert({
        title: 'Core wallet methods restored',
        text: 'BTC and ETH funding routes have been refreshed.',
        icon: 'success',
        confirmButtonText: 'Done',
      })
    } catch (error) {
      await fireAlert({
        title: 'Unable to restore core wallets',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    }
  }

  async function handleToggleAsset(asset: SupportedAsset) {
    try {
      await updateSupportedAsset(asset.id, { isActive: !asset.isActive })
    } catch (error) {
      await fireAlert({
        title: 'Unable to update asset',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    }
  }

  async function handleEditAsset(asset: SupportedAsset) {
    const address = window.prompt(`Update wallet address for ${asset.symbol}`, asset.address)
    if (address === null) return
    const note = window.prompt(`Update user note for ${asset.symbol}`, asset.note)
    if (note === null) return

    try {
      await updateSupportedAsset(asset.id, { address, note })
    } catch (error) {
      await fireAlert({
        title: 'Unable to edit asset',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    }
  }

  async function handleDeleteAsset(asset: SupportedAsset) {
    if (!window.confirm(`Delete ${asset.symbol}?`)) return

    try {
      await deleteSupportedAsset(asset.id)
    } catch (error) {
      await fireAlert({
        title: 'Unable to delete asset',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    }
  }

  async function handleAdjustBalance() {
    if (!adjustUserId || !adjustAmount) {
      await fireAlert({
        title: 'Enter a user and amount',
        text: 'Choose a user account and enter the amount to adjust.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    const amount = Number(adjustAmount)
    if (Number.isNaN(amount) || amount === 0) {
      await fireAlert({
        title: 'Enter a valid amount',
        text: 'The balance adjustment must be a non-zero number.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    try {
      setAdjusting(true)
      await adjustUserBalance(adjustUserId, amount, adjustNote)
      setAdjustUserId('')
      setAdjustAmount('')
      setAdjustNote('')
      await fireAlert({
        title: 'Balance updated',
        text: 'The account ledger has been refreshed.',
        icon: 'success',
        confirmButtonText: 'Done',
      })
    } catch (error) {
      await fireAlert({
        title: 'Unable to adjust balance',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setAdjusting(false)
    }
  }

  async function handleSendNotification() {
    if (!notificationTitle || !notificationMessage) {
      await fireAlert({
        title: 'Complete the notification form',
        text: 'Enter both a title and message.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    if (!sendToAllUsers && !notificationUserId) {
      await fireAlert({
        title: 'Choose a user or select all users',
        text: 'Choose a user or check "Send to all users".',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    try {
      setSendingNotification(true)
      console.log('Sending notification - sendToAllUsers:', sendToAllUsers, 'users count:', users.length)
      if (sendToAllUsers) {
        // Send to all users
        console.log('Sending to all users...')
        const promises = users.map((user) =>
          createUserNotification(user.id, {
            title: notificationTitle,
            message: notificationMessage,
            type: 'info',
            link: '/dashboard',
          })
        )
        await Promise.all(promises)
        console.log('All notifications sent successfully')
      } else {
        // Send to specific user
        console.log('Sending to specific user:', notificationUserId)
        await createUserNotification(notificationUserId, {
          title: notificationTitle,
          message: notificationMessage,
          type: 'info',
          link: '/dashboard',
        })
        console.log('Single notification sent successfully')
      }
      setNotificationUserId('')
      setNotificationTitle('')
      setNotificationMessage('')
      setSendToAllUsers(false)
    } catch (error) {
      await fireAlert({
        title: 'Unable to send notification',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setSendingNotification(false)
    }
  }

  async function handleToggleSuspension(entry: UserProfile) {
    const nextStatus = entry.accountStatus === 'suspended' ? 'active' : 'suspended'
    const reason = nextStatus === 'suspended' ? window.prompt('Reason for restriction:') ?? '' : ''

    try {
      await setUserAccountStatus(entry.id, nextStatus, reason)
    } catch (error) {
      await fireAlert({
        title: 'Unable to update account status',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    }
  }

  if (loading || !user || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center px-6 text-slate-600">Loading control center...</div>
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f8fbff_45%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">NovaVest Control Center</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Live operations and approvals</h1>
              <p className="mt-2 max-w-3xl text-slate-600">
                Confirm funding, withdrawals, KYC, loans, investment packages, and account restrictions from one workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleRestoreCoreAssets}>Restore BTC / ETH Wallets</Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
            </div>
          </div>
        </section>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <section className="grid gap-4 md:grid-cols-5">
              <MetricCard label="Users" value={String(users.length)} />
              <MetricCard label="Pending deposits" value={String(pendingCounts.deposits)} />
              <MetricCard label="Pending withdrawals" value={String(pendingCounts.withdrawals)} />
              <MetricCard label="Pending KYC" value={String(pendingCounts.kyc)} />
              <MetricCard label="Pending packages" value={String(pendingCounts.investments)} />
            </section>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6 mt-6">
            <Card className="rounded-[28px] border-slate-200">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Funding methods</CardTitle>
                  <p className="text-sm text-slate-500">Manage the wallet routes users see on the funding screen.</p>
                </div>
                <div className="text-sm text-slate-500">Core live wallets: BTC and ETH</div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-5">
                  <Input placeholder="Symbol" value={assetForm.symbol} onChange={(event) => setAssetForm({ ...assetForm, symbol: event.target.value.toUpperCase() })} />
                  <Input placeholder="Name" value={assetForm.name} onChange={(event) => setAssetForm({ ...assetForm, name: event.target.value })} />
                  <Input placeholder="Network" value={assetForm.network} onChange={(event) => setAssetForm({ ...assetForm, network: event.target.value })} />
                  <Input placeholder="Address" value={assetForm.address} onChange={(event) => setAssetForm({ ...assetForm, address: event.target.value })} />
                  <Input placeholder="User note" value={assetForm.note} onChange={(event) => setAssetForm({ ...assetForm, note: event.target.value })} />
                </div>
                <Button onClick={handleCreateAsset} className="bg-primary text-white hover:bg-primary/90" disabled={savingAsset}>
                  {savingAsset ? 'Saving...' : 'Add Funding Method'}
                </Button>

                <div className="grid gap-4 lg:grid-cols-2">
                  {assets.map((asset) => (
                    <div key={asset.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-lg font-semibold text-slate-950">{asset.symbol} · {asset.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{asset.network}</p>
                          <p className="mt-3 break-all rounded-2xl bg-white px-4 py-3 font-mono text-xs text-slate-600">{asset.address}</p>
                          <p className="mt-3 text-sm text-slate-600">{asset.note}</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${asset.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {asset.isActive ? 'Live' : 'Hidden'}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleToggleAsset(asset)}>
                              {asset.isActive ? 'Hide' : 'Activate'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditAsset(asset)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteAsset(asset)}>Delete</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6 mt-6">
            <section className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[28px] border-slate-200">
                <CardHeader>
                  <CardTitle>Ledger controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <select value={adjustUserId} onChange={(event) => setAdjustUserId(event.target.value)} className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none">
                      <option value="">Choose a user</option>
                      {users.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.firstName} {entry.lastName} - {entry.email}
                        </option>
                      ))}
                    </select>
                    <Input type="number" placeholder="Amount" value={adjustAmount} onChange={(event) => setAdjustAmount(event.target.value)} />
                    <Input placeholder="Memo" value={adjustNote} onChange={(event) => setAdjustNote(event.target.value)} />
                  </div>
                  <Button onClick={handleAdjustBalance} className="bg-primary text-white hover:bg-primary/90" disabled={adjusting}>
                    {adjusting ? 'Updating...' : 'Apply Balance Adjustment'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-slate-200">
                <CardHeader>
                  <CardTitle>Broadcast notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendToAll"
                      checked={sendToAllUsers}
                      onCheckedChange={(checked) => setSendToAllUsers(checked as boolean)}
                    />
                    <label htmlFor="sendToAll" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Send to all users
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <select
                      value={notificationUserId}
                      onChange={(event) => setNotificationUserId(event.target.value)}
                      disabled={sendToAllUsers}
                      className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none disabled:opacity-50"
                    >
                      <option value="">Choose a user</option>
                      {users.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.firstName} {entry.lastName} - {entry.email}
                        </option>
                      ))}
                    </select>
                    <Input placeholder="Title" value={notificationTitle} onChange={(event) => setNotificationTitle(event.target.value)} />
                    <Input placeholder="Message" value={notificationMessage} onChange={(event) => setNotificationMessage(event.target.value)} />
                  </div>
                  <Button onClick={handleSendNotification} className="bg-primary text-white hover:bg-primary/90" disabled={sendingNotification}>
                    {sendingNotification ? 'Sending...' : 'Send Notification'}
                  </Button>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6 mt-6">
            <QueueCard title="Investment package requests" empty="No package requests yet.">
              {investmentRequests.map((item) => (
                <ReviewRow
                  key={item.id}
                  title={item.planName}
                  subtitle={`${formatCurrency(item.amount)} • ${item.termDays} days • ${item.roiPercent}% ROI`}
                  meta={`${formatDateTime(item.createdAt)} • user ${item.userId}`}
                  status={item.status}
                  onApprove={() => review('investment', item.id, 'approved')}
                  onReject={() => review('investment', item.id, 'rejected')}
                />
              ))}
            </QueueCard>

            <QueueCard title="Deposit confirmations" empty="No deposit confirmations yet.">
              {deposits.map((item) => (
                <ReviewRow
                  key={item.id}
                  title={`${item.assetSymbol} funding notice`}
                  subtitle={`${formatCurrency(item.expectedAmount)} • ${item.network}`}
                  meta={`${formatDateTime(item.createdAt)} • user ${item.userId}`}
                  status={item.status}
                  onApprove={() => review('deposit', item.id, 'approved')}
                  onReject={() => review('deposit', item.id, 'rejected')}
                />
              ))}
            </QueueCard>

            <QueueCard title="Withdrawal requests" empty="No withdrawal requests yet.">
              {withdrawals.map((item) => (
                <ReviewRow
                  key={item.id}
                  title={item.walletName}
                  subtitle={`${formatCurrency(item.amount)} • fee ${formatCurrency(item.fee)}`}
                  meta={`${formatDateTime(item.createdAt)} • user ${item.userId}`}
                  status={item.status}
                  onApprove={() => review('withdrawal', item.id, 'approved')}
                  onReject={() => review('withdrawal', item.id, 'rejected')}
                />
              ))}
            </QueueCard>

            <section className="grid gap-6 xl:grid-cols-2">
              <QueueCard title="Loan requests" empty="No loan requests yet.">
                {loans.map((item) => (
                  <ReviewRow
                    key={item.id}
                    title={`${formatCurrency(item.amount)} loan`}
                    subtitle={`${item.termMonths} months • ${item.purpose}`}
                    meta={`${formatDateTime(item.createdAt)} • user ${item.userId}`}
                    status={item.status}
                    onApprove={() => review('loan', item.id, 'approved')}
                    onReject={() => review('loan', item.id, 'rejected')}
                  />
                ))}
              </QueueCard>

              <QueueCard title="KYC submissions" empty="No KYC submissions yet.">
                {kycItems.map((item) => (
                  <ReviewRow
                    key={item.id}
                    title={`${item.fullName} • level ${item.level}`}
                    subtitle={`${item.documentType} • ${item.documentNumber}`}
                    meta={`${formatDateTime(item.createdAt)} • user ${item.userId}`}
                    status={item.status}
                    onApprove={() => review('kyc', item.id, 'approved')}
                    onReject={() => review('kyc', item.id, 'rejected')}
                  />
                ))}
              </QueueCard>
            </section>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-6">
            <Card className="rounded-[28px] border-slate-200">
              <CardHeader>
                <CardTitle>User directory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Balance</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((entry) => (
                        <tr key={entry.id} className="border-b border-slate-100">
                          <td className="px-4 py-4 text-sm text-slate-900">{entry.firstName} {entry.lastName}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.email}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            <div className="capitalize">{entry.role}</div>
                            <div className="text-xs text-slate-500">{entry.accountStatus}</div>
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">{formatCurrency(entry.balance)}</td>
                          <td className="px-4 py-4 text-right">
                            <Button size="sm" variant="outline" onClick={() => handleToggleSuspension(entry)}>
                              {entry.accountStatus === 'suspended' ? 'Restore' : 'Suspend'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-[24px] border-slate-200">
      <CardContent className="pt-6">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  )
}

function QueueCard({
  title,
  empty,
  children,
}: {
  title: string
  empty: string
  children: ReactNode
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children

  return (
    <Card className="rounded-[28px] border-slate-200">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items && (Array.isArray(items) ? items.length > 0 : true) ? items : <p className="text-sm text-slate-500">{empty}</p>}
      </CardContent>
    </Card>
  )
}

function ReviewRow({
  title,
  subtitle,
  meta,
  status,
  onApprove,
  onReject,
}: {
  title: string
  subtitle: string
  meta: string
  status: string
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          <p className="mt-2 text-xs text-slate-500">{meta}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${status === 'approved' ? 'bg-emerald-100 text-emerald-700' : status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
            {status}
          </span>
          <Button size="sm" onClick={onApprove} disabled={status !== 'pending'}>Approve</Button>
          <Button size="sm" variant="outline" onClick={onReject} disabled={status !== 'pending'}>Reject</Button>
        </div>
      </div>
    </div>
  )
}
