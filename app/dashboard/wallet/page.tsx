'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Plus, ShieldCheck, Wallet, Trash2, Edit2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { createWallet, deleteWallet, subscribeToWallets, updateWallet } from '@/lib/firebase/firestore'
import { fireAlert } from '@/lib/alerts'
import type { WalletRecord } from '@/lib/firebase/types'

export default function WalletPage() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<WalletRecord[]>([])
  const [showAddWallet, setShowAddWallet] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletRecord | null>(null)
  
  const [saving, setSaving] = useState(false)
  const [walletName, setWalletName] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [walletNetwork, setWalletNetwork] = useState('ERC-20')

  useEffect(() => {
    if (!user) return
    return subscribeToWallets(user.uid, setWallets)
  }, [user])

  async function handleSaveWallet() {
    if (!user) return
    if (!walletName || !walletAddress) {
      await fireAlert({
        title: 'Missing wallet details',
        text: 'Enter a wallet name and blockchain address before saving.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    try {
      setSaving(true)
      if (editingWallet) {
        await updateWallet(editingWallet.id, {
          name: walletName,
          network: walletNetwork,
          address: walletAddress,
        })
      } else {
        await createWallet(user.uid, {
          name: walletName,
          network: walletNetwork,
          address: walletAddress,
        })
      }
      resetForm()
    } catch (error) {
      await fireAlert({
        title: 'Unable to save wallet',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setWalletName('')
    setWalletAddress('')
    setWalletNetwork('ERC-20')
    setShowAddWallet(false)
    setEditingWallet(null)
  }

  function startEdit(wallet: WalletRecord) {
    setEditingWallet(wallet)
    setWalletName(wallet.name)
    setWalletAddress(wallet.address)
    setWalletNetwork(wallet.network)
    setShowAddWallet(true)
  }

  async function handleDelete(wallet: WalletRecord) {
    const confirmed = await fireAlert({
      title: 'Delete wallet?',
      text: `Are you sure you want to remove "${wallet.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      confirmButtonColor: '#e11d48'
    })

    if (!confirmed.isConfirmed) return

    try {
      await deleteWallet(wallet.id)
    } catch (error) {
      await fireAlert({
        title: 'Error deleting wallet',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error'
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Wallet Setup</h1>
          <p className="mt-2 text-slate-600">Manage the destination wallets this account can use for future withdrawals.</p>
        </div>
        <Button onClick={() => setShowAddWallet((value) => !value)} className="gap-2 rounded-full bg-primary text-white">
          <Plus size={18} />
          {showAddWallet ? 'Close Panel' : 'Add Withdrawal Wallet'}
        </Button>
      </div>

      <Card className="dashboard-card rounded-[30px] border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Wallet Rules
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Saved wallets are reused by the withdrawal page. User-managed addresses are protected by multi-factor authentication requirements during actual transfers.
          </CardDescription>
        </CardHeader>
      </Card>

      {showAddWallet && (
        <Card className="dashboard-card border-2 border-primary/20 rounded-[30px] bg-primary/5">
          <CardHeader>
            <CardTitle className="text-foreground">{editingWallet ? 'Edit' : 'Add New'} Withdrawal Wallet</CardTitle>
            <CardDescription className="text-muted-foreground">This wallet record is stored securely for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Wallet Name</label>
                <Input placeholder="e.g. Main BTC Wallet" value={walletName} onChange={(event) => setWalletName(event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Network</label>
                <select
                  value={walletNetwork}
                  onChange={(event) => setWalletNetwork(event.target.value)}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-base text-slate-900 outline-none"
                >
                  <option value="Bitcoin">Bitcoin</option>
                  <option value="ERC-20">ERC-20</option>
                  <option value="TRC-20">TRC-20</option>
                  <option value="Solana">Solana</option>
                </select>
              </div>
              <div className="lg:col-span-3">
                <label className="mb-2 block text-sm font-medium text-slate-700">Wallet Address</label>
                <Input placeholder="Paste destination wallet address" value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleSaveWallet} className="rounded-full bg-primary text-white hover:bg-primary/90" disabled={saving}>
                {saving ? 'Saving...' : editingWallet ? 'Update Wallet' : 'Save Wallet'}
              </Button>
              <Button variant="outline" onClick={resetForm} className="rounded-full">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-xl font-bold text-primary">Saved Wallets</h2>
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="dashboard-card group rounded-[28px] border-border transition-all hover:border-primary/30">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 overflow-hidden ring-1 ring-slate-100 shadow-inner">
                      <img
                        src={wallet.network.toLowerCase().includes('btc') ? '/assets/crypto/btc.jpg' : '/assets/crypto/eth.jpg'}
                        alt={wallet.network}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">{wallet.name}</p>
                      <p className="text-sm text-gray-600">{wallet.network}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(wallet)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-primary hover:text-white">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(wallet)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-rose-500 hover:text-white">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-3">
                    <p className="mb-1 text-xs text-gray-600">Address</p>
                    <div className="flex items-start gap-2">
                      <p className="break-all font-mono text-sm text-gray-900">{wallet.address}</p>
                      <button onClick={() => navigator.clipboard.writeText(wallet.address)} className="rounded p-1 hover:bg-gray-100">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-600">Status</p>
                    <p className="font-bold capitalize text-gray-900">{wallet.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {wallets.length === 0 && (
            <Card className="dashboard-card rounded-[28px] border-border">
              <CardContent className="py-10 text-sm text-muted-foreground text-center">No wallets saved yet. Click the button above to add one.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
