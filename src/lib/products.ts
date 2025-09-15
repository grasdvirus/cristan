
export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: any; // Firestore Timestamp
};

export type Product = {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[]; // Changed from imageUrls to mediaUrls to support video
  dataAiHint: string;
  price: number;
  originalPrice?: number;
  collection?: string;
  internetClass?: string;
  articleCategory?: string;
  redirectUrl?: string;
  isRecommended?: boolean;
  createdAt?: any; // Firestore Timestamp
  colors?: string[];
  sizes?: string[];
  likes?: number;
  comments?: Comment[];
};

    
