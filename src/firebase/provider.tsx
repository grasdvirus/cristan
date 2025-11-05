'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userState, setUserState] = useState<{
    user: User | null;
    isUserLoading: boolean;
    userError: Error | null;
  }>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, isUserLoading: false, userError: new Error("Auth service not available.") });
      return;
    }
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUserState({ user, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("Firebase Auth State Error:", error);
        setUserState({ user: null, isUserLoading: false, userError: error });
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo(() => ({
    firebaseApp,
    firestore,
    auth,
    ...userState
  }), [firebaseApp, firestore, auth, userState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

function useFirebaseContext() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebaseContext must be used within a FirebaseProvider.');
    }
    return context;
}

export const useFirebase = () => {
    const context = useFirebaseContext();
    if (!context.firebaseApp || !context.firestore || !context.auth) {
        throw new Error('Firebase services not available. Check FirebaseProvider setup.');
    }
    return context as Required<FirebaseContextState>;
};

export const useAuth = (): Auth => useFirebase().auth;
export const useFirestore = (): Firestore => useFirebase().firestore;
export const useFirebaseApp = (): FirebaseApp => useFirebase().firebaseApp;
export const useUser = () => {
    const { user, isUserLoading, userError } = useFirebaseContext();
    return { user, isUserLoading, userError };
}

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  const memoized = useMemo(factory, deps);
  if (typeof memoized === 'object' && memoized !== null) {
    Object.defineProperty(memoized, '__memo', { value: true, enumerable: false });
  }
  return memoized;
}
