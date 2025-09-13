
'use client';

import { useState, useEffect } from 'react';
import type { Subscription } from '@/lib/subscriptions';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        setLoading(true);
        const subsCollection = query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'));
        const subsSnapshot = await getDocs(subsCollection);
        const subs = subsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
        setSubscriptions(subs);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch subscriptions in hook:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    loadSubscriptions();
  }, []);

  return { subscriptions, loading, error, setSubscriptions };
}
