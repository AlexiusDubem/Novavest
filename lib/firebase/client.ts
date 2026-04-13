'use client'

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

let analyticsStarted = false
let firebaseApp: FirebaseApp | null = null

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }
}

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp

  const firebaseConfig = getFirebaseConfig()
  const missingConfig = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingConfig.length > 0) {
    throw new Error(`Missing Firebase environment variables: ${missingConfig.join(', ')}`)
  }

  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  return firebaseApp
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp())
}

export function getDb() {
  return getFirestore(getFirebaseApp())
}

export async function initializeFirebaseAnalytics() {
  const firebaseConfig = getFirebaseConfig()
  if (analyticsStarted || typeof window === 'undefined' || !firebaseConfig.measurementId) return
  if (!(await isSupported())) return

  getAnalytics(getFirebaseApp())
  analyticsStarted = true
}
