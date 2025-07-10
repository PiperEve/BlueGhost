// src/state/rewindStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post } from './postStore';

export interface SavedPost extends Post {
  savedAt: Date;
  monthSaved: string; // Format: "2024-01"
  isPremiumSave: boolean;
}

interface RewindState {
  savedPosts: SavedPost[];
  hasActiveSubscription: boolean;
  
  // Actions
  savePost: (post: Post) => Promise<boolean>;
  canSaveThisMonth: () => boolean;
  getCurrentMonthKey: () => string;
  purchaseRewind: () => Promise<boolean>;
  getSavedPosts: () => SavedPost[];
  deleteSavedPost: (postId: string) => void;
  getMonthlyUsage: () => { used: number, max: number };
  resetMonthlyRewinds: () => void;
}

export const useRewindStore = create<RewindState>()(
  persist(
    (set, get) => ({
      savedPosts: [],
      hasActiveSubscription: false,
      
      getCurrentMonthKey: () => {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      },
      
      getMonthlyUsage: () => {
        const state = get();
        const currentMonth = state.getCurrentMonthKey();
        
        const used = state.savedPosts.filter(
          p => p.monthSaved === currentMonth && !p.isPremiumSave
        ).length;
        
        const max = state.hasActiveSubscription ? 10 : 3;
        
        return { used, max };
      },
      
      canSaveThisMonth: () => {
        const { used, max } = get().getMonthlyUsage();
        return used < max;
      },
      
      savePost: async (post: Post) => {
        const state = get();
        const currentMonth = state.getCurrentMonthKey();
        const { used, max } = state.getMonthlyUsage();
        
        // Check if user can save (free tier limit)
        const isPremiumSave = state.hasActiveSubscription || used >= max;
        
        if (!isPremiumSave && used >= max) {
          return false;
        }
        
        const savedPost: SavedPost = {
          ...post,
          savedAt: new Date(),
          monthSaved: currentMonth,
          isPremiumSave,
        };
        
        set((state) => ({
          savedPosts: [savedPost, ...state.savedPosts],
        }));
        
        return true;
      },
      
      purchaseRewind: async () => {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Grant 5 extra rewinds immediately
        const now = new Date();
        const currentMonth = get().getCurrentMonthKey();
        
        set((state) => ({
          hasActiveSubscription: true,
          savedPosts: [
            ...state.savedPosts,
            ...Array(5).fill(null).map((_, i) => ({
              id: `rewind_${Date.now()}_${i}`,
              userId: 'system',
              username: 'Rewind Token',
              content: 'Rewind credit',
              backgroundColor: '#f0f9ff',
              textColor: '#0369a1',
              likes: 0,
              dislikes: 0,
              createdAt: now,
              expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, 0),
              savedAt: now,
              monthSaved: currentMonth,
              isPremiumSave: true,
            } as SavedPost))
          ]
        }));
        
        return true;
      },
      
      getSavedPosts: () => {
        return get().savedPosts.sort(
          (a, b) => b.savedAt.getTime() - a.savedAt.getTime()
        );
      },
      
      deleteSavedPost: (postId: string) => {
        set((state) => ({
          savedPosts: state.savedPosts.filter(p => p.id !== postId)
        }));
      },
      
      resetMonthlyRewinds: () => {
        const state = get();
        const currentMonth = state.getCurrentMonthKey();
        
        // Only keep premium saves and current month's items
        set({
          savedPosts: state.savedPosts.filter(
            p => p.isPremiumSave || p.monthSaved === currentMonth
          )
        }, false);
      },
    }),
    {
      name: 'rewind-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Automatically reset free rewinds at month change
      onRehydrateStorage: () => (state) => {
        if (state) state.resetMonthlyRewinds();
      }
    }
  )
);