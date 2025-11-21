import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  let videoId = '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/shorts/')[1] || '';
    }
  } catch (error) {
    return null; // Not a valid URL
  }
  return videoId || null;
}

export function convertToEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes("embed")) {
    return url;
  }
  
  const videoId = getYoutubeVideoId(url);

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return url;
}

export function getYoutubeThumbnailUrl(url: string): string | null {
  const videoId = getYoutubeVideoId(url);
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}