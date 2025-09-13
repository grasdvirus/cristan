
export type Video = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dataAiHint: string;
  src: string;
  views: number;
  channel: string;
  uploadDate: string; // ISO 8601 string
  creator: {
    name: string;
    avatar: string;
    subscribers: number;
  };
  likes: number;
  isPaid?: boolean;
  duration?: number; // Duration in minutes
};

    
