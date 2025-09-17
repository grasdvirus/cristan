
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Feature } from '@/lib/features';
import { db } from '@/lib/firebase';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';

// Hook to get the features data and loading state
export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "features"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const featuresData: Feature[] = [];
      querySnapshot.forEach((doc) => {
        featuresData.push({ id: doc.id, ...doc.data() } as Feature);
      });
      setFeatures(featuresData);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch features in hook:", err);
      setError(err.message || 'An unknown error occurred');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { features, loading, error };
}

// Separate hook to get only the setter function
// This avoids re-rendering components that only need to set the state
export function useSetFeatures() {
  const [_, setFeatures] = useState<Feature[]>([]);
  
  const manualSetFeatures = useCallback((newFeatures: Feature[] | ((prev: Feature[]) => Feature[])) => {
    setFeatures(newFeatures);
  }, []);

  return manualSetFeatures;
}
