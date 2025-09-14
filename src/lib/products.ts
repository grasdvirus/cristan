
export type Product = {
  id: string;
  title: string;
  description: string;
  imageUrls: string[]; // Changed from imageUrl: string
  dataAiHint: string;
  price: number;
  collection?: string;
  internetClass?: string;
  articleCategory?: string;
  redirectUrl?: string;
  isRecommended?: boolean;
  createdAt?: any; // Firestore Timestamp
};

    
