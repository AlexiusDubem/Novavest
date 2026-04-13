'use client'

import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { createUserProfile, ensureOAuthUserProfile } from '@/lib/firebase/firestore'
import type { SignupPayload } from '@/lib/firebase/types'

export async function initializeAuthPersistence() {
  const auth = getFirebaseAuth()
  await setPersistence(auth, browserLocalPersistence)
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

export async function signUpWithEmail(payload: SignupPayload) {
  const auth = getFirebaseAuth()
  await initializeAuthPersistence()
  const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password)
  await createUserProfile(credential.user, payload)
  return credential.user
}

export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  await initializeAuthPersistence()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  await initializeAuthPersistence()
  const result = await signInWithPopup(auth, provider)
  await ensureOAuthUserProfile(result.user)
  return result.user
}

export async function signOutUser() {
  const auth = getFirebaseAuth()
  await signOut(auth)
}
