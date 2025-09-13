
'use client';

import { useState, useEffect } from 'react';
import type { Slide } from '@/lib/slides';

export function useSlides() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSlides() {
      try {
        setLoading(true);
        const response = await fetch('/api/slides/get');
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Failed to fetch slides. Status:', response.status, 'Body:', errorBody);
            throw new Error(`Failed to fetch slides: ${response.statusText}`);
        }
        const data = await response.json();
        setSlides(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch slides in hook:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    loadSlides();
  }, []);

  return { slides, loading, error, setSlides };
}
