
'use client';

import { create } from 'zustand';

type FilterState = {
  activeArticleCategory: string;
  setArticleCategory: (category: string) => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  activeArticleCategory: 'all',
  setArticleCategory: (category) => set({ activeArticleCategory: category }),
}));
