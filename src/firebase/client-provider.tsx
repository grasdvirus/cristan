
'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This effect runs only once on the client after the component mounts.
    // It's the safest place to initialize client-side libraries.
    if (typeof window !== 'undefined' && !services) {
        const initializedServices = initializeFirebase();
        setServices(initializedServices);
    }
  }, [services]); // The empty dependency array is crucial.

  if (!services) {
    // While services are initializing, you can return a loader
    // or null to prevent children from rendering without Firebase.
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <LoadingSpinner />
        </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
