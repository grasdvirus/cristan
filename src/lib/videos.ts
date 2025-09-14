

export type Video = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  shortPreviewUrl?: string;
  dataAiHint: string;
  src: string;
  views: number;
  channel: string;
  uploadDate: string; // ISO 8601 string
  likes: number;
  isPaid?: boolean;
  duration?: number; // Duration in minutes
  isRecommended?: boolean;
  createdAt?: any; // Firestore Timestamp
};

    
