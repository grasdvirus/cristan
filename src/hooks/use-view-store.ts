
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ViewState {
  viewedArticleIds: string[];
  addViewedArticle: (id: string) => void;
}

export const useViewStore = create(
  persist<ViewState>(
    (set) => ({
      viewedArticleIds: [],
      addViewedArticle: (id: string) => {
        set((state) => {
          if (state.viewedArticleIds.includes(id)) {
            return state; // No change needed
          }
          return {
            viewedArticleIds: [...state.viewedArticleIds, id],
          };
        });
      },
    }),
    {
      name: 'view-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
