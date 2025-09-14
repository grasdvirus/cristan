

import type { Product } from './products';

// A simplified version of Product for storing in an order
type OrderItem = {
  id: string;
  title: string;
  price: number;
  collection?: string;
  internetClass?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  transactionId: string;
  customerNotes?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: any; // Firestore Timestamp
  status: 'pending' | 'completed' | 'failed';
};
