'use client'

export const STORAGE_KEYS = {
  onboardingPending: 'BOLDWAVE-onboarding-pending',
  onboardingComplete: 'BOLDWAVE-onboarding-complete',
  wallets: 'BOLDWAVE-wallets',
} as const

export interface SavedWallet {
  id: number
  name: string
  network: string
  address: string
  status: 'Active'
  purpose: 'Withdrawal' | 'Trading' | 'Primary'
}

export const defaultWallets: SavedWallet[] = [
  {
    id: 1,
    name: 'Primary Vault',
    network: 'ERC-20',
    address: '0x1234...5678',
    status: 'Active',
    purpose: 'Primary',
  },
]

export function readWallets() {
  if (typeof window === 'undefined') return defaultWallets

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.wallets)
    if (!raw) return defaultWallets
    const parsed = JSON.parse(raw) as SavedWallet[]
    return parsed.length > 0 ? parsed : defaultWallets
  } catch {
    return defaultWallets
  }
}

export function writeWallets(wallets: SavedWallet[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.wallets, JSON.stringify(wallets))
}
