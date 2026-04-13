import type { Timestamp } from 'firebase/firestore'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

export function formatDate(value?: Timestamp | null) {
  if (!value) return 'Just now'
  return value.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(value?: Timestamp | null) {
  if (!value) return 'Just now'
  return value.toDate().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
