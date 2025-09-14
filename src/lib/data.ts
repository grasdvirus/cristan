
'use client';

import { create } from 'zustand';

export type CategoryItem = {
  id: string;
  label: string;
  subscribers?: number; // Optional, only for tvChannels
};

// Cet état contiendra les catégories chargées depuis la base de données
interface CategoryStore {
  articleCategories: CategoryItem[];
  productCollections: CategoryItem[];
  internetClasses: CategoryItem[];
  tvChannels: CategoryItem[];
  setCategories: (categories: Partial<Omit<CategoryStore, 'setCategories' | 'loading' | 'error' | 'fetchCategories'>>) => void;
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  articleCategories: [],
  productCollections: [],
  internetClasses: [],
  tvChannels: [],
  loading: true,
  error: null,
  setCategories: (categories) => set((state) => ({ ...state, ...categories })),
  fetchCategories: async () => {
    // Évite les chargements multiples inutiles, mais permet le re-fetch
    if (get().loading || get().articleCategories.length > 0) {
      // return;
    }

    set({ loading: true });

    try {
      const response = await fetch('/api/config/categories/get');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      set({
        articleCategories: data.articleCategories || [],
        productCollections: data.productCollections || [],
        internetClasses: data.internetClasses || [],
        tvChannels: data.tvChannels?.map((ch: any) => ({ ...ch, subscribers: ch.subscribers || 0 })) || [],
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error(error);
      set({ error: error.message, loading: false });
    }
  },
}));

// Initialiser le chargement des catégories au démarrage de l'application
if (typeof window !== 'undefined') {
  useCategoryStore.getState().fetchCategories();
}

// Export pour utilisation simple dans les composants
export const useArticleCategories = () => useCategoryStore((state) => state.articleCategories);
export const useProductCollections = () => useCategoryStore((state) => state.productCollections);
export const useInternetClasses = () => useCategoryStore((state) => state.internetClasses);
export const useTvChannels = () => useCategoryStore((state) => state.tvChannels);
