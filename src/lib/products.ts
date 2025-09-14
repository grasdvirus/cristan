
export type Product = {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[]; // Changed from imageUrls to mediaUrls to support video
  dataAiHint: string;
  price: number;
  collection?: string;
  internetClass?: string;
  articleCategory?: string;
  redirectUrl?: string;
  isRecommended?: boolean;
  createdAt?: any; // Firestore Timestamp
  colors?: string[];
  sizes?: string[];
};

    

