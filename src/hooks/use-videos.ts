
'use client';

import { useState, useEffect } from 'react';
import type { Video } from '@/lib/videos';

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        const response = await fetch('/api/videos/get');
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Failed to fetch videos. Status:', response.status, 'Body:', errorBody);
            throw new Error(`Failed to fetch videos: ${response.statusText}`);
        }
        const data = await response.json();
        setVideos(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch videos in hook:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  return { videos, loading, error, setVideos };
}

    