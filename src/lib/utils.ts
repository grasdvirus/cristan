import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToEmbedUrl(url: string): string {
  if (url.includes("embed")) {
    return url; // Already an embed URL
  }

  let videoId = '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    }
  } catch (error) {
     // Fallback for non-URL strings or invalid formats
    console.error("Invalid URL for YouTube conversion:", url, error);
    return url; // Return original url if parsing fails
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return url; // Return original if no ID found
}
