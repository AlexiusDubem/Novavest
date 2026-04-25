import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'user' | 'admin'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected'
export type AccountStatus = 'active' | 'suspended'

export interface UserProfile {
  id: string
  uid: string
  email: string
  firstName: string
  lastName: string
  phone: string
  country: string
  goal: string
  investmentPackage: string
  portfolioId: string
  role: UserRole
  accountStatus: AccountStatus
  suspensionReason: string
  balance: number
  totalProfit: number
  activeLoanBalance: number
  kycLevel: number
  kycStatus: KycStatus
  onboardingCompleted: boolean
  withdrawalPin: string
  lastLogin?: Timestamp | null
  notifications: {
    email: boolean
    sms: boolean
  }
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface ActivityLogRecord {
  id: string
  userId: string
  action: string
  ipAddress?: string
  userAgent?: string
  metadata?: any
  createdAt: Timestamp
}

export interface WalletRecord {
  id: string
  userId: string
  name: string
  network: string
  address: string
  status: 'active'
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface SupportedAsset {
  id: string
  symbol: string
  name: string
  network: string
  address: string
  note: string
  isActive: boolean
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface TransactionRecord {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'loan' | 'adjustment'
  amount: number
  status: RequestStatus | 'completed'
  title: string
  description: string
  assetSymbol?: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface NotificationRecord {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'alert'
  read: boolean
  link?: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface TicketReply {
  id: string
  authorRole: 'user' | 'admin'
  authorName: string
  message: string
  createdAt?: Timestamp | null
}

export interface SupportTicketRecord {
  id: string
  userId: string
  category: string
  subject: string
  message: string
  priority: 'Normal' | 'High' | 'Urgent'
  status: 'Open' | 'Resolved'
  replies?: TicketReply[]
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface InvestmentRequestRecord {
  id: string
  userId: string
  planName: string
  roiPercent: number
  termDays: number
  amount: number
  requirements: string
  status: RequestStatus
  reviewerNote: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
  approvedAt?: Timestamp | null
  approvedBy?: string | null
}

export interface InvestmentRecord {
  id: string
  userId: string
  planName: string
  roiPercent: number
  termDays: number
  principal: number
  requirements: string
  status: 'active' | 'completed'
  startedAt?: Timestamp | null
  endsAt?: Timestamp | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface DepositRequest {
  id: string
  userId: string
  assetId: string
  assetSymbol: string
  network: string
  address: string
  expectedAmount: number
  status: RequestStatus
  adminNote: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
  approvedAt?: Timestamp | null
  approvedBy?: string | null
}

export interface WithdrawalRequest {
  id: string
  userId: string
  walletId: string
  walletName: string
  network: string
  address: string
  amount: number
  fee: number
  status: RequestStatus
  adminNote: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
  approvedAt?: Timestamp | null
  approvedBy?: string | null
}

export interface LoanRequest {
  id: string
  userId: string
  amount: number
  termMonths: number
  purpose: string
  status: RequestStatus
  adminNote: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
  approvedAt?: Timestamp | null
  approvedBy?: string | null
}

export interface KycSubmission {
  id: string
  userId: string
  level: number
  fullName?: string
  dateOfBirth?: string
  ssn?: string
  addressLine?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  documentType?: string
  documentNumber?: string
  hasDocuments?: boolean
  documentUrls?: string[]
  status: RequestStatus
  adminNote: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
  approvedAt?: Timestamp | null
  approvedBy?: string | null
}

export interface SignupPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  country: string
  goal: string
  investmentPackage: string
}

export interface ProfileUpdatePayload {
  firstName: string
  lastName: string
  phone: string
  country: string
}
