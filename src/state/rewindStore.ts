import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post } from './postStore';

export interface SavedPost extends Post {
  savedAt: Date;
  monthSaved: string; // Format: "2024-01"
}

interface RewindState {
  savedPosts: SavedPost[];
  rewindsUsedThisMonth: number;
  maxRewindsPerMonth: number;
  hasActiveSubscription: boolean;
  
  // Actions
  savePost: (post: Post) => Promise<boolean>;
  canSaveThisMonth: () => boolean;
  getCurrentMonthKey: () => string;
  purchaseRewind: () => Promise<boolean>;
  getSavedPosts: () => SavedPost[];
  deleteSavedPost: (postId: string) => void;
}

export const useRewindStore = create<RewindState>()(
  persist(
    (set, get) => ({
      savedPosts: [],
      rewindsUsedThisMonth: 0,
      maxRewindsPerMonth: 1,
      hasActiveSubscription: false,
      
      getCurrentMonthKey: () => {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      },
      
      canSaveThisMonth: () => {
        const state = get();
        const currentMonth = state.getCurrentMonthKey();
        const savedThisMonth = state.savedPosts.filter(p => p.monthSaved === currentMonth).length;
        return savedThisMonth < state.maxRewindsPerMonth;
      },
      
      savePost: async (post: Post) => {
        const state = get();
        
        if (!state.canSaveThisMonth()) {
          return false;
		  
        const exists = state.savedPosts.some(p => p.id === post.id);
		if (exists) return false;
        
        const savedPost: SavedPost = {
          ...post,
          savedAt: new Date(),
          monthSaved: state.getCurrentMonthKey(),
        };
        
        set((state) => ({
          savedPosts: [savedPost, ...state.savedPosts],
		  rewindsUsedThisMonth: state.rewindsUsedThisMonth + 1, // Track usage
        }));
        
        return true;
      },
      
      purchaseRewind: async () => {
        // Mock payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In real app, this would integrate with Stripe/Apple Pay
        set({ hasActiveSubscription: true });
        return true;
      },
      
      getSavedPosts: () => {
        return get().savedPosts;
      },
      
      deleteSavedPost: (postId: string) => {
        set((state) => ({
          savedPosts: state.savedPosts.filter(p => p.id !== postId)
        }));
      },
    }),
    {
      name: 'rewind-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);