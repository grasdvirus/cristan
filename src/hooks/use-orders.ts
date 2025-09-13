
'use client';

import { useState, useEffect } from 'react';
import type { Order } from '@/lib/orders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const response = await fetch('/api/orders/get');
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Failed to fetch orders. Status:', response.status, 'Body:', errorBody);
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }
        const data = await response.json();
        setOrders(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch orders in hook:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return { orders, loading, error, setOrders };
}
