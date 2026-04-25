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
  setUserWithdrawalPin,
  setWithdrawalRequestStatus,
  subscribeToAllDeposits,
  subscribeToAllInvestmentRequests,
  subscribeToAllKycSubmissions,
  subscribeToAllLoans,
  subscribeToAllSupportedAssets,
  subscribeToAllSupportTickets,
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
  SupportTicketRecord,
  UserProfile,
  WithdrawalRequest,
} from '@/lib/firebase/types'
import { UserDirectory } from '@/components/admin/UserDirectory'
import { RequestQueues } from '@/components/admin/RequestQueues'
import { AdminTools } from '@/components/admin/AdminTools'
import { SupportInbox } from '@/components/admin/SupportInbox'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faDashboard, faShieldHalved, faUsers, faListCheck, faWrench, faArrowLeft, faXmark, faWallet } from '@fortawesome/free-solid-svg-icons'

type ReviewType = 'deposit' | 'withdrawal' | 'loan' | 'kyc' | 'investment'


export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [deposits, setDeposits] = useState<DepositRequest[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loans, setLoans] = useState<LoanRequest[]>([])
  const [kycItems, setKycItems] = useState<KycSubmission[]>([])
  const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequestRecord[]>([])
  const [assets, setAssets] = useState<SupportedAsset[]>([])
  const [supportTickets, setSupportTickets] = useState<SupportTicketRecord[]>([])
  
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
    const stopTickets = subscribeToAllSupportTickets(setSupportTickets)

    return () => {
      stopUsers()
      stopDeposits()
      stopWithdrawals()
      stopLoans()
      stopKyc()
      stopInvestments()
      stopAssets()
      stopTickets()
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
      ? window.prompt('Optional reason for rejection:') ?? ''
      : ''

    try {
      if (type === 'deposit') await setDepositRequestStatus(requestId, status, user.uid, note)
      if (type === 'withdrawal') await setWithdrawalRequestStatus(requestId, status, user.uid, note)
      if (type === 'loan') await setLoanRequestStatus(requestId, status, user.uid, note)
      if (type === 'kyc') await setKycSubmissionStatus(requestId, status, user.uid, note)
      if (type === 'investment') await setInvestmentRequestStatus(requestId, status, user.uid, note)
      
      await fireAlert({
        title: 'Action complete',
        text: `Request has been marked as ${status}.`,
        icon: 'success',
        confirmButtonText: 'Done',
      })
    } catch (error) {
      await fireAlert({
        title: 'Action failed',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    }
  }

  // (Helper functions handleCreateAsset, handleRestoreCoreAssets, handleToggleAsset, etc. remain here or moved to separate file)
  // I'll keep them here for now to avoid too many files, but scoped properly.

  async function handleCreateAsset() {
    if (Object.values(assetForm).some((value) => !value)) {
      await fireAlert({ title: 'Complete the asset form', text: 'All fields are required.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }
    try {
      setSavingAsset(true)
      await createSupportedAsset(assetForm)
      setAssetForm({ symbol: '', name: '', network: '', address: '', note: '' })
      await fireAlert({ title: 'Saved', text: 'Funding asset is now live.', icon: 'success', confirmButtonText: 'Done' })
    } catch (error) {
      await fireAlert({ title: 'Error', text: error instanceof Error ? error.message : 'Try again.', icon: 'error', confirmButtonText: 'Retry' })
    } finally { setSavingAsset(false) }
  }

  async function handleRestoreCoreAssets() {
    try {
      await seedAdminCollectionsIfMissing()
      await fireAlert({ title: 'Restored', text: 'BTC/ETH wallets refreshed.', icon: 'success', confirmButtonText: 'Done' })
    } catch (error) {
      await fireAlert({ title: 'Error', text: 'Check connection.', icon: 'error', confirmButtonText: 'Retry' })
    }
  }

  async function handleToggleAsset(asset: SupportedAsset) {
    try { await updateSupportedAsset(asset.id, { isActive: !asset.isActive }) } 
    catch (error) { await fireAlert({ title: 'Sync Error', text: 'Firebase error.', icon: 'error', confirmButtonText: 'Retry' }) }
  }

  async function handleEditAsset(asset: SupportedAsset) {
    const address = window.prompt(`Update wallet address for ${asset.symbol}`, asset.address)
    if (address === null) return
    const note = window.prompt(`Update user note for ${asset.symbol}`, asset.note)
    if (note === null) return
    try { await updateSupportedAsset(asset.id, { address, note }) } 
    catch (error) { await fireAlert({ title: 'Edit Error', text: 'Check settings.', icon: 'error', confirmButtonText: 'Retry' }) }
  }

  async function handleDeleteAsset(asset: SupportedAsset) {
    if (!window.confirm(`Delete ${asset.symbol}?`)) return
    try { await deleteSupportedAsset(asset.id) } 
    catch (error) { await fireAlert({ title: 'Delete Error', text: 'Check permissions.', icon: 'error', confirmButtonText: 'Retry' }) }
  }

  async function handleAdjustBalance() {
    if (!adjustUserId || !adjustAmount) {
      await fireAlert({ title: 'Details missing', text: 'Choose a user and amount.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }
    const amount = Number(adjustAmount)
    if (Number.isNaN(amount) || amount === 0) {
      await fireAlert({ title: 'Invalid amount', text: 'Non-zero number required.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }
    try {
      setAdjusting(true)
      await adjustUserBalance(adjustUserId, amount, adjustNote)
      setAdjustUserId(''); setAdjustAmount(''); setAdjustNote('')
      await fireAlert({ title: 'Success', text: 'Account credit confirmed.', icon: 'success', confirmButtonText: 'Done' })
    } catch (error) {
       await fireAlert({ title: 'Adjustment failed', text: error instanceof Error ? error.message : 'Try again.', icon: 'error', confirmButtonText: 'Retry' })
    } finally { setAdjusting(false) }
  }

  async function handleSendNotification() {
    if (!notificationTitle || !notificationMessage) {
      await fireAlert({ title: 'Form incomplete', text: 'Title and message are required.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }
    try {
      setSendingNotification(true)
      if (sendToAllUsers) {
        const promises = users.map((user) => createUserNotification(user.id, { title: notificationTitle, message: notificationMessage, type: 'info', link: '/dashboard' }))
        await Promise.all(promises)
      } else {
        if (!notificationUserId) throw new Error('Choose a recipient.')
        await createUserNotification(notificationUserId, { title: notificationTitle, message: notificationMessage, type: 'info', link: '/dashboard' })
      }
      setNotificationUserId(''); setNotificationTitle(''); setNotificationMessage(''); setSendToAllUsers(false)
      await fireAlert({ title: 'Broadcast complete', text: 'Messages sent to recipients.', icon: 'success', confirmButtonText: 'Done' })
    } catch (error) {
      await fireAlert({ title: 'Sync error', text: error instanceof Error ? error.message : 'Try again.', icon: 'error', confirmButtonText: 'Retry' })
    } finally { setSendingNotification(false) }
  }

  async function handleToggleSuspension(entry: UserProfile) {
    const nextStatus = entry.accountStatus === 'suspended' ? 'active' : 'suspended'
    const reason = nextStatus === 'suspended' ? window.prompt('Reason for restriction:') ?? '' : ''
    try { await setUserAccountStatus(entry.id, nextStatus, reason) } 
    catch (error) { await fireAlert({ title: 'Sync Error', text: 'Update failed.', icon: 'error', confirmButtonText: 'Retry' }) }
  }
  async function handleSetWithdrawalPin(entry: UserProfile, pin: string) {
    try {
      await setUserWithdrawalPin(entry.id, pin)
      await createUserNotification(entry.id, {
        title: 'Withdrawal PIN Secured',
        message: 'Your unique withdrawal PIN has been successfully generated and applied to your account. You can now proceed with secure transactions.',
        type: 'success',
        link: '/dashboard/settings'
      })
      await fireAlert({ title: 'PIN Updated', text: `Withdrawal PIN for ${entry.firstName} has been set to ${pin}.`, icon: 'success', confirmButtonText: 'OK' })
    } catch (error) {
       await fireAlert({ title: 'Update Failed', text: 'Firebase error occurred.', icon: 'error', confirmButtonText: 'Retry' })
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Syncing Control Center...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 pb-20">
        {/* Institutional Header */}
        <section className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex gap-6 items-center">
            <div className="h-20 w-20 rounded-[32px] bg-emerald-600 flex items-center justify-center text-white shadow-xl">
              <FontAwesomeIcon icon={faShieldHalved} className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">BOLDWAVE Ops v4.2</p>
              <h1 className="mt-1 text-3xl font-black tracking-tighter text-slate-900">Control Center</h1>
              <div className="mt-2 flex items-center gap-3">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />)}
                 </div>
                 <p className="text-xs font-bold text-slate-500">{users.length} Active Workspaces Managed</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
             <Button 
               variant="outline" 
               className="rounded-2xl h-12 px-6 border-slate-200 text-[10px] font-black uppercase tracking-widest"
               onClick={handleRestoreCoreAssets}
             >
               <FontAwesomeIcon icon={faRotate} className="mr-2" />
               Reset BTC/ETH Wallets
             </Button>
             <Button 
               className="rounded-2xl h-12 px-6 bg-emerald-600 text-[10px] font-black uppercase tracking-widest transition hover:bg-emerald-700 active:scale-95"
               onClick={() => router.push('/dashboard')}
             >
               <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
               Back to Workspace
             </Button>
          </div>
        </section>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-4 no-scrollbar">
            <TabsList className="inline-flex h-14 items-center rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
              <TabsTrigger value="overview" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <FontAwesomeIcon icon={faDashboard} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white relative">
                <FontAwesomeIcon icon={faListCheck} />
                Requests
                {Object.values(pendingCounts).reduce((a, b) => a + b, 0) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white outline outline-2 outline-white">
                    {Object.values(pendingCounts).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <FontAwesomeIcon icon={faWallet} />
                Assets
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <FontAwesomeIcon icon={faUsers} />
                Users
              </TabsTrigger>
              <TabsTrigger value="support" className="relative flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <FontAwesomeIcon icon={faWrench} />
                Support
                {supportTickets.filter((t) => t.status === 'Open').length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white outline outline-2 outline-white">
                    {supportTickets.filter((t) => t.status === 'Open').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <FontAwesomeIcon icon={faWrench} />
                Sys Tools
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 mt-6 focus-visible:outline-none">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard label="Portfolios" value={String(users.length)} />
              <MetricCard label="Liquidity Review" value={String(pendingCounts.deposits)} warn={pendingCounts.deposits > 0} />
              <MetricCard label="Exits Pending" value={String(pendingCounts.withdrawals)} warn={pendingCounts.withdrawals > 0} />
              <MetricCard label="Identity Review" value={String(pendingCounts.kyc)} warn={pendingCounts.kyc > 0} />
              <MetricCard label="Mandates" value={String(pendingCounts.investments)} warn={pendingCounts.investments > 0} />
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6 mt-6 focus-visible:outline-none">
            <RequestQueues title="Mandate Activations" items={investmentRequests} type="investment" onReview={review} />
            <RequestQueues title="Treasury Funding notices" items={deposits} type="deposit" onReview={review} />
            <RequestQueues title="Liquidity Exit requests" items={withdrawals} type="withdrawal" onReview={review} />
            
            <div className="grid xl:grid-cols-2 gap-6">
               <RequestQueues title="Strategic Capital" items={loans} type="loan" onReview={review} />
               <RequestQueues title="Verification Queue" items={kycItems} type="kyc" onReview={review} />
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6 mt-6 focus-visible:outline-none">
             <Card className="rounded-[28px] border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-8 px-10">
                   <CardTitle className="text-xl font-bold">Treasury Gateway</CardTitle>
                   <p className="text-sm text-slate-500">Enable or modify public cryptocurrency funding routes.</p>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                   <div className="grid gap-4 md:grid-cols-5 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                      <Input placeholder="SYMBOL" value={assetForm.symbol} onChange={(event) => setAssetForm({ ...assetForm, symbol: event.target.value.toUpperCase() })} className="h-12 rounded-xl bg-white" />
                      <Input placeholder="Label" value={assetForm.name} onChange={(event) => setAssetForm({ ...assetForm, name: event.target.value })} className="h-12 rounded-xl bg-white" />
                      <Input placeholder="Network" value={assetForm.network} onChange={(event) => setAssetForm({ ...assetForm, network: event.target.value })} className="h-12 rounded-xl bg-white" />
                      <Input placeholder="Address" value={assetForm.address} onChange={(event) => setAssetForm({ ...assetForm, address: event.target.value })} className="h-12 rounded-xl bg-white md:col-span-2" />
                      <Input placeholder="Public Instruction Note" value={assetForm.note} onChange={(event) => setAssetForm({ ...assetForm, note: event.target.value })} className="h-12 rounded-xl bg-white md:col-span-4" />
                      <Button onClick={handleCreateAsset} className="h-12 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition active:scale-95" disabled={savingAsset}>
                         Deploy Asset
                      </Button>
                   </div>

                   <div className="grid gap-6 lg:grid-cols-2">
                      {assets.map((asset) => (
                        <div key={asset.id} className="group relative rounded-[32px] border border-slate-200 bg-white p-8 transition-all hover:border-emerald-500/30">
                          <div className="flex flex-col gap-6 sm:flex-row sm:items-start justify-between">
                            <div>
                               <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-900 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                     {asset.symbol.slice(0, 2)}
                                  </div>
                                  <div>
                                     <p className="font-black text-slate-900">{asset.name}</p>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{asset.network}</p>
                                  </div>
                               </div>
                               <p className="mt-4 break-all rounded-2xl bg-slate-50 px-4 py-3 font-mono text-[11px] text-slate-600 border border-slate-100">
                                  {asset.address}
                               </p>
                            </div>
                            <div className="flex flex-col items-end gap-4">
                               <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${asset.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                 {asset.isActive ? 'Active' : 'Offline'}
                               </span>
                               <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl" onClick={() => handleToggleAsset(asset)} title="Toggle Status">
                                     <FontAwesomeIcon icon={faRotate} className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest" onClick={() => handleEditAsset(asset)}>Edit</Button>
                                  <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl text-rose-500 hover:bg-rose-50 border-rose-100" onClick={() => handleDeleteAsset(asset)}>
                                     <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                                  </Button>
                               </div>
                            </div>
                          </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="users" className="focus-visible:outline-none">
             <UserDirectory 
               users={users} 
               onToggleSuspension={handleToggleSuspension} 
               onSetWithdrawalPin={handleSetWithdrawalPin}
             />
          </TabsContent>

          <TabsContent value="support" className="focus-visible:outline-none mt-6">
            <SupportInbox tickets={supportTickets} />
          </TabsContent>

          <TabsContent value="tools" className="focus-visible:outline-none">
             <AdminTools 
               users={users}
               adjustUserId={adjustUserId} setAdjustUserId={setAdjustUserId}
               adjustAmount={adjustAmount} setAdjustAmount={setAdjustAmount}
               adjustNote={adjustNote} setAdjustNote={setAdjustNote}
               onAdjustBalance={handleAdjustBalance}
               adjusting={adjusting}
               notificationUserId={notificationUserId} setNotificationUserId={setNotificationUserId}
               notificationTitle={notificationTitle} setNotificationTitle={setNotificationTitle}
               notificationMessage={notificationMessage} setNotificationMessage={setNotificationMessage}
               sendToAllUsers={sendToAllUsers} setSendToAllUsers={setSendToAllUsers}
               onSendNotification={handleSendNotification}
               sendingNotification={sendingNotification}
             />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function MetricCard({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <Card className={`rounded-[32px] border-slate-200 transition-all ${warn ? 'bg-rose-50/50 border-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.05)]' : 'bg-white'}`}>
      <CardContent className="pt-6 pb-8 px-8">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
        <p className={`mt-3 text-4xl font-black tracking-tighter ${warn ? 'text-rose-600' : 'text-slate-900'}`}>{value}</p>
        <div className={`mt-4 h-1 w-12 rounded-full ${warn ? 'bg-rose-500' : 'bg-slate-100'}`} />
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
