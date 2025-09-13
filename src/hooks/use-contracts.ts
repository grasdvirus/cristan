
'use client';

import { useState, useEffect } from 'react';
import type { Contract } from '@/lib/contracts';

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContracts() {
      try {
        setLoading(true);
        const response = await fetch('/api/contracts/get');
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Failed to fetch contracts. Status:', response.status, 'Body:', errorBody);
            throw new Error(`Failed to fetch contracts: ${response.statusText}`);
        }
        const data = await response.json();
        setContracts(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch contracts in hook:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    loadContracts();
  }, []);

  return { contracts, loading, error, setContracts };
}
