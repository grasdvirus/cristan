
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';

interface CartState {
  items: Product[];
  total: number;
  addToCart: (item: Product) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      total: 0,
      
      addToCart: (item: Product) => {
        const { items } = get();
        // Prevent duplicates
        if (items.find(i => i.id === item.id)) {
            return;
        }
        set(state => {
            const newItems = [...state.items, item];
            const newTotal = newItems.reduce((acc, curr) => acc + curr.price, 0);
            return { items: newItems, total: newTotal };
        });
      },

      removeFromCart: (itemId: string) => {
        set(state => {
            const newItems = state.items.filter(i => i.id !== itemId);
            const newTotal = newItems.reduce((acc, curr) => acc + curr.price, 0);
            return { items: newItems, total: newTotal };
        });
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },
    }),
    {
      name: 'cart-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
