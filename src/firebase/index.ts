'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// A type guard to check if the code is running in a browser environment
const isBrowser = (): boolean => typeof window !== 'undefined';

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

let firebaseServices: FirebaseServices | null = null;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): FirebaseServices {
  // Ensure this only runs on the client
  if (!isBrowser()) {
    throw new Error("Firebase can only be initialized on the client side.");
  }

  // If already initialized, return the existing services
  if (firebaseServices) {
    return firebaseServices;
  }

  // Initialize if no apps exist yet
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseServices = { firebaseApp: app, auth, firestore };
  
  return firebaseServices;
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';