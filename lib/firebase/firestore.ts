'use client'

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { getDb } from '@/lib/firebase/client'
import type {
  DepositRequest,
  InvestmentRecord,
  InvestmentRequestRecord,
  KycSubmission,
  LoanRequest,
  NotificationRecord,
  ProfileUpdatePayload,
  RequestStatus,
  SignupPayload,
  SupportedAsset,
  SupportTicketRecord,
  TransactionRecord,
  UserProfile,
  WalletRecord,
  WithdrawalRequest,
} from '@/lib/firebase/types'

const usersCollection = () => collection(getDb(), 'users')
const walletsCollection = () => collection(getDb(), 'wallets')
const supportedAssetsCollection = () => collection(getDb(), 'supportedAssets')
const notificationsCollection = () => collection(getDb(), 'notifications')
const supportTicketsCollection = () => collection(getDb(), 'supportTickets')
const transactionsCollection = () => collection(getDb(), 'transactions')
const depositRequestsCollection = () => collection(getDb(), 'depositRequests')
const investmentRequestsCollection = () => collection(getDb(), 'investmentRequests')
const investmentsCollection = () => collection(getDb(), 'investments')
const withdrawalRequestsCollection = () => collection(getDb(), 'withdrawalRequests')
const loanRequestsCollection = () => collection(getDb(), 'loanRequests')
const kycSubmissionsCollection = () => collection(getDb(), 'kycSubmissions')

function mapSnapshot<T extends { id: string }>(
  snapshot: { docs: Array<{ id: string; data: () => Omit<T, 'id'> }> },
) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as T[]
}

function portfolioIdFromUid(uid: string) {
  return `BW-${uid.slice(0, 6).toUpperCase()}`
}

export async function createUserProfile(user: User, payload: SignupPayload) {
  const profileRef = doc(usersCollection(), user.uid)
  const profile: Omit<UserProfile, 'id'> = {
    uid: user.uid,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    country: payload.country,
    goal: payload.goal,
    investmentPackage: payload.investmentPackage,
    portfolioId: portfolioIdFromUid(user.uid),
    role: payload.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? 'admin' : 'user',
    accountStatus: 'active',
    suspensionReason: '',
    balance: 0,
    totalProfit: 0,
    activeLoanBalance: 0,
    kycLevel: 0,
    kycStatus: 'not_started',
    onboardingCompleted: false,
    withdrawalPin: '',
    lastLogin: serverTimestamp(),
    notifications: {
      email: true,
      sms: false,
    },
    createdAt: serverTimestamp() as never,
    updatedAt: serverTimestamp() as never,
  }

  await setDoc(profileRef, profile, { merge: true })
  await logUserActivity(user.uid, 'ACCOUNT_CREATED', { email: payload.email })
}

export async function logUserActivity(userId: string, action: string, metadata: any = {}) {
  try {
    await addDoc(collection(getDb(), 'activityLogs'), {
      userId,
      action,
      metadata,
      ipAddress: 'detected', // Placeholder for edge function IP
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('Activity log failed:', err)
  }
}

export async function recordUserLogin(uid: string) {
  await updateDoc(doc(usersCollection(), uid), {
    lastLogin: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await logUserActivity(uid, 'USER_LOGIN')
}

export async function ensureOAuthUserProfile(user: User) {
  const profileRef = doc(usersCollection(), user.uid)
  const existingProfile = await getDoc(profileRef)
  if (existingProfile.exists()) return

  const [firstName = 'Investor', ...rest] = (user.displayName || '').split(' ').filter(Boolean)
  const lastName = rest.join(' ') || 'Account'

  await createUserProfile(user, {
    firstName,
    lastName,
    email: user.email || '',
    phone: '',
    password: '',
    country: '',
    goal: 'growth',
    investmentPackage: 'starter',
  })
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void): Unsubscribe {
  return onSnapshot(doc(usersCollection(), uid), (snapshot) => {
    callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as UserProfile) : null)
  })
}

export async function updateUserProfile(uid: string, payload: Partial<ProfileUpdatePayload & UserProfile>) {
  await updateDoc(doc(usersCollection(), uid), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function setUserWithdrawalPin(uid: string, pin: string) {
  await updateDoc(doc(usersCollection(), uid), {
    withdrawalPin: pin,
    updatedAt: serverTimestamp(),
  })
}

function subscribeList<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (items: T[]) => void,
) {
  return onSnapshot(query(collection(getDb(), collectionName), ...constraints), (snapshot) => {
    const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as T[]
    callback(items)
  })
}

function subscribeListWithSorting<T extends { id: string, createdAt?: Timestamp | null }>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (items: T[]) => void,
) {
  return onSnapshot(query(collection(getDb(), collectionName), ...constraints), (snapshot) => {
    const items = (snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() })) as T[])
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0
        const bTime = b.createdAt?.toMillis() || 0
        return bTime - aTime
      })
    callback(items)
  })
}

export function subscribeToWallets(uid: string, callback: (items: WalletRecord[]) => void) {
  return subscribeListWithSorting<WalletRecord>('wallets', [where('userId', '==', uid)], callback)
}

export async function createWallet(uid: string, payload: Pick<WalletRecord, 'name' | 'network' | 'address'>) {
  await addDoc(walletsCollection(), {
    userId: uid,
    name: payload.name,
    network: payload.network,
    address: payload.address,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateWallet(walletId: string, payload: Partial<Pick<WalletRecord, 'name' | 'network' | 'address'>>) {
  await updateDoc(doc(walletsCollection(), walletId), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteWallet(walletId: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(walletsCollection(), walletId))
}

export function subscribeToSupportedAssets(callback: (items: SupportedAsset[]) => void) {
  return subscribeList<SupportedAsset>('supportedAssets', [where('isActive', '==', true), orderBy('symbol', 'asc')], callback)
}

export function subscribeToAllSupportedAssets(callback: (items: SupportedAsset[]) => void) {
  return subscribeList<SupportedAsset>('supportedAssets', [orderBy('symbol', 'asc')], callback)
}

export function subscribeToNotifications(uid: string, callback: (items: NotificationRecord[]) => void) {
  console.log('Setting up notification subscription for user:', uid)
  return subscribeListWithSorting<NotificationRecord>('notifications', [where('userId', '==', uid)], (notifications) => {
    console.log('Received notifications:', notifications.length)
    callback(notifications)
  })
}

export async function createUserNotification(
  uid: string,
  payload: Omit<NotificationRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'read'>,
) {
  console.log('Creating notification for user:', uid, 'payload:', payload)
  try {
    const docRef = await addDoc(notificationsCollection(), {
      userId: uid,
      ...payload,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log('Notification created successfully with ID:', docRef.id)
    return docRef
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(notificationsCollection(), notificationId), {
    read: true,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteNotification(notificationId: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(notificationsCollection(), notificationId))
}

export async function clearAllNotifications(uid: string, notificationIds: string[]) {
  const { deleteDoc } = await import('firebase/firestore')
  await Promise.all(
    notificationIds.map((id) => deleteDoc(doc(notificationsCollection(), id)))
  )
}

export async function deleteSupportedAsset(assetId: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(supportedAssetsCollection(), assetId))
}

export function subscribeToSupportTickets(uid: string, callback: (items: SupportTicketRecord[]) => void) {
  return subscribeListWithSorting<SupportTicketRecord>('supportTickets', [where('userId', '==', uid)], callback)
}

export function subscribeToAllSupportTickets(callback: (items: SupportTicketRecord[]) => void) {
  return subscribeListWithSorting<SupportTicketRecord>('supportTickets', [], callback)
}

export async function addTicketReply(
  ticketId: string,
  reply: { authorRole: 'user' | 'admin'; authorName: string; message: string },
) {
  const { arrayUnion } = await import('firebase/firestore')
  await updateDoc(doc(supportTicketsCollection(), ticketId), {
    replies: arrayUnion({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorRole: reply.authorRole,
      authorName: reply.authorName,
      message: reply.message,
      createdAt: Timestamp.now(),
    }),
    updatedAt: serverTimestamp(),
  })
}

export async function resolveTicket(ticketId: string) {
  await updateDoc(doc(supportTicketsCollection(), ticketId), {
    status: 'Resolved',
    updatedAt: serverTimestamp(),
  })
}

export async function createSupportTicket(
  uid: string,
  payload: Omit<SupportTicketRecord, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt' | 'replies'>,
) {
  await addDoc(supportTicketsCollection(), {
    userId: uid,
    ...payload,
    status: 'Open',
    replies: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Notify the user — swallow permission errors gracefully
  try {
    await createUserNotification(uid, {
      title: 'Support ticket created',
      message: `Your support request "${payload.subject}" has been received.`,
      type: 'info',
      link: '/dashboard/support',
    })
  } catch {
    // Notification is best-effort; ticket creation already succeeded
  }
}

export async function createSupportedAsset(payload: Pick<SupportedAsset, 'symbol' | 'name' | 'network' | 'address' | 'note'>) {
  await addDoc(supportedAssetsCollection(), {
    ...payload,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateSupportedAsset(assetId: string, payload: Partial<SupportedAsset>) {
  await updateDoc(doc(supportedAssetsCollection(), assetId), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToTransactions(uid: string, callback: (items: TransactionRecord[]) => void) {
  return subscribeListWithSorting<TransactionRecord>('transactions', [where('userId', '==', uid)], callback)
}

export function subscribeToAllTransactions(callback: (items: TransactionRecord[]) => void) {
  return subscribeListWithSorting<TransactionRecord>('transactions', [], callback)
}

export function subscribeToDeposits(uid: string, callback: (items: DepositRequest[]) => void) {
  return subscribeListWithSorting<DepositRequest>('depositRequests', [where('userId', '==', uid)], callback)
}

export function subscribeToInvestmentRequests(uid: string, callback: (items: InvestmentRequestRecord[]) => void) {
  return subscribeListWithSorting<InvestmentRequestRecord>('investmentRequests', [where('userId', '==', uid)], callback)
}

export function subscribeToInvestments(uid: string, callback: (items: InvestmentRecord[]) => void) {
  return subscribeListWithSorting<InvestmentRecord>('investments', [where('userId', '==', uid)], callback)
}

export async function createDepositRequest(
  uid: string,
  asset: SupportedAsset,
  expectedAmount: number,
) {
  await addDoc(depositRequestsCollection(), {
    userId: uid,
    assetId: asset.id,
    assetSymbol: asset.symbol,
    network: asset.network,
    address: asset.address,
    expectedAmount,
    status: 'pending',
    adminNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedAt: null,
    approvedBy: null,
  })

  await createUserNotification(uid, {
    title: 'Payment notice received',
    message: `Your ${asset.symbol} payment notice for ${expectedAmount} USD is awaiting confirmation from BOLDWAVE.`,
    type: 'info',
    link: '/dashboard/deposit',
  })
}

export async function createInvestmentRequest(
  uid: string,
  payload: Pick<InvestmentRequestRecord, 'planName' | 'roiPercent' | 'termDays' | 'amount' | 'requirements'>,
) {
  await addDoc(investmentRequestsCollection(), {
    userId: uid,
    ...payload,
    status: 'pending',
    reviewerNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedAt: null,
    approvedBy: null,
  })

  await createUserNotification(uid, {
    title: 'Package request received',
    message: `${payload.planName} is now awaiting confirmation from BOLDWAVE.`,
    type: 'info',
    link: '/dashboard/investment-plans',
  })
}

export function subscribeToWithdrawals(uid: string, callback: (items: WithdrawalRequest[]) => void) {
  return subscribeListWithSorting<WithdrawalRequest>('withdrawalRequests', [where('userId', '==', uid)], callback)
}

export async function createWithdrawalRequest(
  uid: string,
  wallet: WalletRecord,
  amount: number,
  fee: number,
) {
  await addDoc(withdrawalRequestsCollection(), {
    userId: uid,
    walletId: wallet.id,
    walletName: wallet.name,
    network: wallet.network,
    address: wallet.address,
    amount,
    fee,
    status: 'pending',
    adminNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedAt: null,
    approvedBy: null,
  })

  await createUserNotification(uid, {
    title: 'Withdrawal request submitted',
    message: `Your withdrawal request for ${amount} USD is awaiting confirmation from BOLDWAVE.`,
    type: 'info',
    link: '/dashboard/withdraw',
  })
}

export function subscribeToLoanRequests(uid: string, callback: (items: LoanRequest[]) => void) {
  return subscribeListWithSorting<LoanRequest>('loanRequests', [where('userId', '==', uid)], callback)
}

export async function createLoanRequest(uid: string, amount: number, termMonths: number, purpose: string) {
  await addDoc(loanRequestsCollection(), {
    userId: uid,
    amount,
    termMonths,
    purpose,
    status: 'pending',
    adminNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedAt: null,
    approvedBy: null,
  })

  await createUserNotification(uid, {
    title: 'Loan request submitted',
    message: `Your loan request for ${amount} USD is awaiting confirmation from BOLDWAVE.`,
    type: 'info',
    link: '/dashboard/loan',
  })
}

export function subscribeToKycSubmissions(uid: string, callback: (items: KycSubmission[]) => void) {
  return subscribeListWithSorting<KycSubmission>('kycSubmissions', [where('userId', '==', uid)], callback)
}

export async function createKycSubmission(uid: string, payload: Partial<Omit<KycSubmission, 'id' | 'userId' | 'status' | 'adminNote'>> & { level: number, country: string }) {
  // Build the submission document, excluding undefined fields
  const submissionData: any = {
    userId: uid,
    status: 'pending',
    adminNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedAt: null,
    approvedBy: null,
    level: payload.level,
    country: payload.country,
  }

  // Add optional fields if they exist
  if (payload.fullName !== undefined) submissionData.fullName = payload.fullName
  if (payload.dateOfBirth !== undefined) submissionData.dateOfBirth = payload.dateOfBirth
  if (payload.ssn !== undefined) submissionData.ssn = payload.ssn
  if (payload.addressLine !== undefined) submissionData.addressLine = payload.addressLine
  if (payload.city !== undefined) submissionData.city = payload.city
  if (payload.state !== undefined) submissionData.state = payload.state
  if (payload.zipCode !== undefined) submissionData.zipCode = payload.zipCode
  if (payload.documentType !== undefined) submissionData.documentType = payload.documentType
  if (payload.documentNumber !== undefined) submissionData.documentNumber = payload.documentNumber

  await addDoc(kycSubmissionsCollection(), submissionData)

  await updateDoc(doc(usersCollection(), uid), {
    kycStatus: 'pending',
    updatedAt: serverTimestamp(),
  })

  // Notification is best-effort; swallow permission errors so KYC success is not masked
  try {
    await createUserNotification(uid, {
      title: 'KYC submission received',
      message: 'Your verification request is under review. You will be notified when it is approved.',
      type: 'info',
    })
  } catch {
    // Safe to ignore — KYC submission already succeeded
  }
}

export function subscribeToAllUsers(callback: (items: UserProfile[]) => void) {
  return subscribeListWithSorting<UserProfile>('users', [], callback)
}

export function subscribeToAllDeposits(callback: (items: DepositRequest[]) => void) {
  return subscribeListWithSorting<DepositRequest>('depositRequests', [], callback)
}

export function subscribeToAllInvestmentRequests(callback: (items: InvestmentRequestRecord[]) => void) {
  return subscribeListWithSorting<InvestmentRequestRecord>('investmentRequests', [], callback)
}

export function subscribeToAllWithdrawals(callback: (items: WithdrawalRequest[]) => void) {
  return subscribeListWithSorting<WithdrawalRequest>('withdrawalRequests', [], callback)
}

export function subscribeToAllLoans(callback: (items: LoanRequest[]) => void) {
  return subscribeListWithSorting<LoanRequest>('loanRequests', [], callback)
}

export function subscribeToAllKycSubmissions(callback: (items: KycSubmission[]) => void) {
  return subscribeListWithSorting<KycSubmission>('kycSubmissions', [], callback)
}

async function createTransactionRecord(payload: Omit<TransactionRecord, 'id'>) {
  await addDoc(transactionsCollection(), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function setDepositRequestStatus(requestId: string, status: RequestStatus, adminUid: string, adminNote: string) {
  await runTransaction(getDb(), async (transaction) => {
    const requestRef = doc(depositRequestsCollection(), requestId)
    const requestSnapshot = await transaction.get(requestRef)
    if (!requestSnapshot.exists()) throw new Error('Deposit request not found.')

    const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as DepositRequest
    if (request.status !== 'pending') throw new Error('This deposit request has already been reviewed.')

    const userRef = doc(usersCollection(), request.userId)
    const userSnapshot = await transaction.get(userRef)
    if (!userSnapshot.exists()) throw new Error('User profile not found.')
    const user = userSnapshot.data() as UserProfile

    transaction.update(requestRef, {
      status,
      adminNote,
      approvedAt: status === 'approved' ? serverTimestamp() : null,
      approvedBy: adminUid,
      updatedAt: serverTimestamp(),
    })

    if (status === 'approved') {
      transaction.update(userRef, {
        balance: Number(user.balance ?? 0) + Number(request.expectedAmount),
        updatedAt: serverTimestamp(),
      })
    }
  })

  const requestSnapshot = await getDoc(doc(depositRequestsCollection(), requestId))
  const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as DepositRequest
  if (status === 'approved') {
    await createTransactionRecord({
      userId: request.userId,
      type: 'deposit',
      amount: request.expectedAmount,
      status: 'completed',
      title: 'Deposit confirmed',
      description: `${request.assetSymbol} deposit confirmed by BOLDWAVE`,
      assetSymbol: request.assetSymbol,
    })
  }

  await createUserNotification(request.userId, {
    title: status === 'approved' ? 'Deposit confirmed' : 'Deposit update',
    message: status === 'approved'
      ? `Your ${request.assetSymbol} deposit has been confirmed and added to your balance.`
      : `Your ${request.assetSymbol} payment notice could not be confirmed. Please review the details and try again.`,
    type: status === 'approved' ? 'success' : 'warning',
    link: '/dashboard/transactions',
  })
}

export async function setInvestmentRequestStatus(requestId: string, status: RequestStatus, adminUid: string, reviewerNote: string) {
  await runTransaction(getDb(), async (transaction) => {
    const requestRef = doc(investmentRequestsCollection(), requestId)
    const requestSnapshot = await transaction.get(requestRef)
    if (!requestSnapshot.exists()) throw new Error('Investment request not found.')

    const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as InvestmentRequestRecord
    if (request.status !== 'pending') throw new Error('This package request has already been reviewed.')

    const userRef = doc(usersCollection(), request.userId)
    const userSnapshot = await transaction.get(userRef)
    if (!userSnapshot.exists()) throw new Error('User profile not found.')
    const user = userSnapshot.data() as UserProfile

    if (status === 'approved' && Number(user.balance ?? 0) < Number(request.amount)) {
      throw new Error('User balance is too low for this package.')
    }

    transaction.update(requestRef, {
      status,
      reviewerNote,
      approvedAt: status === 'approved' ? serverTimestamp() : null,
      approvedBy: adminUid,
      updatedAt: serverTimestamp(),
    })

    if (status === 'approved') {
      transaction.update(userRef, {
        balance: Number(user.balance ?? 0) - Number(request.amount),
        updatedAt: serverTimestamp(),
      })

      const investmentRef = doc(investmentsCollection())
      transaction.set(investmentRef, {
        userId: request.userId,
        planName: request.planName,
        roiPercent: request.roiPercent,
        termDays: request.termDays,
        principal: request.amount,
        requirements: request.requirements,
        status: 'active',
        startedAt: serverTimestamp(),
        endsAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  })

  const requestSnapshot = await getDoc(doc(investmentRequestsCollection(), requestId))
  const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as InvestmentRequestRecord

  if (status === 'approved') {
    await createTransactionRecord({
      userId: request.userId,
      type: 'adjustment',
      amount: -request.amount,
      status: 'completed',
      title: 'Investment package started',
      description: `${request.planName} package activated by BOLDWAVE`,
    })
  }

  await createUserNotification(request.userId, {
    title: status === 'approved' ? 'Package started' : 'Package request declined',
    message:
      status === 'approved'
        ? `${request.planName} is now active in your portfolio. Live ROI tracking has started.`
        : reviewerNote || `${request.planName} could not be started at this time.`,
    type: status === 'approved' ? 'success' : 'warning',
    link: '/dashboard/investment-plans',
  })
}

export async function setWithdrawalRequestStatus(requestId: string, status: RequestStatus, adminUid: string, adminNote: string) {
  await runTransaction(getDb(), async (transaction) => {
    const requestRef = doc(withdrawalRequestsCollection(), requestId)
    const requestSnapshot = await transaction.get(requestRef)
    if (!requestSnapshot.exists()) throw new Error('Withdrawal request not found.')

    const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as WithdrawalRequest
    if (request.status !== 'pending') throw new Error('This withdrawal request has already been reviewed.')

    const userRef = doc(usersCollection(), request.userId)
    const userSnapshot = await transaction.get(userRef)
    if (!userSnapshot.exists()) throw new Error('User profile not found.')
    const user = userSnapshot.data() as UserProfile

    if (status === 'approved' && Number(user.balance ?? 0) < Number(request.amount)) {
      throw new Error('User balance is too low for this withdrawal.')
    }

    transaction.update(requestRef, {
      status,
      adminNote,
      approvedAt: status === 'approved' ? serverTimestamp() : null,
      approvedBy: adminUid,
      updatedAt: serverTimestamp(),
    })

    if (status === 'approved') {
      transaction.update(userRef, {
        balance: Number(user.balance ?? 0) - Number(request.amount),
        updatedAt: serverTimestamp(),
      })
    }
  })

  const requestSnapshot = await getDoc(doc(withdrawalRequestsCollection(), requestId))
  const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as WithdrawalRequest
  if (status === 'approved') {
    await createTransactionRecord({
      userId: request.userId,
      type: 'withdrawal',
      amount: request.amount,
      status: 'completed',
      title: 'Withdrawal approved',
      description: `Withdrawal sent to ${request.walletName}`,
    })
  }

  await createUserNotification(request.userId, {
    title: status === 'approved' ? 'Withdrawal confirmed' : 'Withdrawal update',
    message: status === 'approved'
      ? `Your withdrawal request for ${request.amount} USD has been confirmed by BOLDWAVE.`
      : `Your withdrawal request could not be completed. ${adminNote || ''}`,
    type: status === 'approved' ? 'success' : 'warning',
    link: '/dashboard/withdraw',
  })
}

export async function adjustUserBalance(userId: string, amount: number, note: string) {
  await runTransaction(getDb(), async (transaction) => {
    const userRef = doc(usersCollection(), userId)
    const userSnapshot = await transaction.get(userRef)
    if (!userSnapshot.exists()) throw new Error('User profile not found.')
    const user = userSnapshot.data() as UserProfile

    transaction.update(userRef, {
      balance: Number(user.balance ?? 0) + amount,
      updatedAt: serverTimestamp(),
    })
  })

  await createTransactionRecord({
    userId,
    type: amount >= 0 ? 'deposit' : 'adjustment',
    amount,
    status: 'completed',
    title: amount >= 0 ? 'Deposit confirmed' : 'Balance debit',
    description: note || (amount >= 0 ? 'Direct account funding by BOLDWAVE' : 'BOLDWAVE balance adjustment'),
  })

  await createUserNotification(userId, {
    title: amount >= 0 ? 'Account credited' : 'Account debited',
    message: note || `BOLDWAVE ${amount >= 0 ? 'credited' : 'debited'} your account by ${Math.abs(amount)} USD.`,
    type: amount >= 0 ? 'success' : 'warning',
    link: '/dashboard/transactions',
  })
}

export async function setLoanRequestStatus(requestId: string, status: RequestStatus, adminUid: string, adminNote: string) {
  await runTransaction(getDb(), async (transaction) => {
    const requestRef = doc(loanRequestsCollection(), requestId)
    const requestSnapshot = await transaction.get(requestRef)
    if (!requestSnapshot.exists()) throw new Error('Loan request not found.')

    const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as LoanRequest
    if (request.status !== 'pending') throw new Error('This loan request has already been reviewed.')

    const userRef = doc(usersCollection(), request.userId)
    const userSnapshot = await transaction.get(userRef)
    if (!userSnapshot.exists()) throw new Error('User profile not found.')
    const user = userSnapshot.data() as UserProfile

    transaction.update(requestRef, {
      status,
      adminNote,
      approvedAt: status === 'approved' ? serverTimestamp() : null,
      approvedBy: adminUid,
      updatedAt: serverTimestamp(),
    })

    if (status === 'approved') {
      transaction.update(userRef, {
        balance: Number(user.balance ?? 0) + Number(request.amount),
        activeLoanBalance: Number(user.activeLoanBalance ?? 0) + Number(request.amount),
        updatedAt: serverTimestamp(),
      })
    }
  })

  const requestSnapshot = await getDoc(doc(loanRequestsCollection(), requestId))
  const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as LoanRequest
  if (status === 'approved') {
    await createTransactionRecord({
      userId: request.userId,
      type: 'loan',
      amount: request.amount,
      status: 'completed',
      title: 'Loan approved',
      description: `${request.termMonths}-month loan released to wallet balance`,
    })
  }

  await createUserNotification(request.userId, {
    title: status === 'approved' ? 'Loan confirmed' : 'Loan update',
    message: status === 'approved'
      ? `Your loan request for ${request.amount} USD has been confirmed by BOLDWAVE.`
      : `Your loan request could not be completed. ${adminNote || 'Please contact support for details.'}`,
    type: status === 'approved' ? 'success' : 'warning',
    link: '/dashboard/loan',
  })
}

export async function setKycSubmissionStatus(
  requestId: string,
  status: RequestStatus,
  adminUid: string,
  adminNote: string,
) {
  await runTransaction(getDb(), async (transaction) => {
    const requestRef = doc(kycSubmissionsCollection(), requestId)
    const requestSnapshot = await transaction.get(requestRef)
    if (!requestSnapshot.exists()) throw new Error('KYC submission not found.')

    const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as KycSubmission
    if (request.status !== 'pending') throw new Error('This KYC submission has already been reviewed.')

    const userRef = doc(usersCollection(), request.userId)
    const userSnapshot = await transaction.get(userRef)
    if (!userSnapshot.exists()) throw new Error('User profile not found.')

    transaction.update(requestRef, {
      status,
      adminNote,
      approvedAt: status === 'approved' ? serverTimestamp() : null,
      approvedBy: adminUid,
      updatedAt: serverTimestamp(),
    })

    transaction.update(userRef, {
      kycLevel: status === 'approved' ? request.level : 0,
      kycStatus: status === 'approved' ? 'verified' : 'rejected',
      updatedAt: serverTimestamp(),
    })
  })

  const requestSnapshot = await getDoc(doc(kycSubmissionsCollection(), requestId))
  const request = { id: requestSnapshot.id, ...requestSnapshot.data() } as KycSubmission

  await createUserNotification(request.userId, {
    title: status === 'approved' ? 'Verification completed' : 'Verification update',
    message: status === 'approved'
      ? 'Your identity verification is complete. You can now deposit and invest.'
      : `Your KYC submission was rejected. ${adminNote || 'Please resubmit with correct documents.'}`,
    type: status === 'approved' ? 'success' : 'warning',
    link: '/dashboard/kyc',
  })
}

export async function markOnboardingComplete(uid: string) {
  await updateDoc(doc(usersCollection(), uid), {
    onboardingCompleted: true,
    updatedAt: serverTimestamp(),
  })
}

export async function deactivateAccount(uid: string) {
  await updateDoc(doc(usersCollection(), uid), {
    accountStatus: 'inactive',
    updatedAt: serverTimestamp(),
  })
}

export async function deleteUserAccount(uid: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(usersCollection(), uid))
}

export async function saveSettings(uid: string, payload: { email: boolean; sms: boolean }) {
  await updateDoc(doc(usersCollection(), uid), {
    notifications: payload,
    updatedAt: serverTimestamp(),
  })
}

export async function setUserAccountStatus(userId: string, status: 'active' | 'suspended', reason: string) {
  await updateDoc(doc(usersCollection(), userId), {
    accountStatus: status,
    suspensionReason: reason,
    updatedAt: serverTimestamp(),
  })

  await createUserNotification(userId, {
    title: status === 'suspended' ? 'Account suspended' : 'Account restored',
    message:
      status === 'suspended'
        ? reason || 'Your account has been suspended. Support remains available.'
        : 'Your account has been restored and all dashboard features are available again.',
    type: status === 'suspended' ? 'alert' : 'success',
    link: '/dashboard/support',
  })
}

export async function seedAdminCollectionsIfMissing() {
  const db = getDb()
  const coreAssets = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'Bitcoin',
      address: '1Pn68t3Zx37AjZ9oHvhCWGnPG2a5tstcRd',
      note: 'Send BTC to this wallet only. After sending, tap "I\'ve Made the Payment" so BOLDWAVE can confirm it.',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      network: 'ERC-20',
      address: '0x4bfdd1b2368ff5a7f8c0507062c12d2c77e2bb84',
      note: 'Send ETH to this wallet only. After sending, tap "I\'ve Made the Payment" so BOLDWAVE can confirm it.',
    },
  ] as const

  for (const asset of coreAssets) {
    const existing = await getDocs(query(supportedAssetsCollection(), where('symbol', '==', asset.symbol), limit(1)))

    if (existing.empty) {
      await addDoc(supportedAssetsCollection(), {
        ...asset,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      continue
    }

    await updateDoc(doc(supportedAssetsCollection(), existing.docs[0].id), {
      ...asset,
      isActive: true,
      updatedAt: serverTimestamp(),
    })
  }

  await setDoc(doc(db, 'meta', 'supported-assets-seeded'), {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}
