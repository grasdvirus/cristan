
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/products';
import { v4 as uuidv4 } from 'uuid';

// An item in the cart can have selected options
export type CartItem = Product & {
  cartId?: string; // Unique ID for this specific item instance in the cart
  selectedColor?: string;
  selectedSize?: string;
};

interface CartState {
  items: CartItem[];
  total: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      total: 0,
      
      addToCart: (itemToAdd: CartItem) => {
        set(state => {
            const newItems = [...state.items, { ...itemToAdd, cartId: uuidv4() }];
            const newTotal = newItems.reduce((acc, curr) => acc + curr.price, 0);
            return { items: newItems, total: newTotal };
        });
      },

      removeFromCart: (cartId: string) => {
        set(state => {
            const newItems = state.items.filter(i => i.cartId !== cartId);
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
