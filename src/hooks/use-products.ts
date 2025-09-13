
'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products/get');
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Failed to fetch products. Status:', response.status, 'Body:', errorBody);
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch products in hook:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return { products, loading, error, setProducts };
}
