// src/state/postStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... (type definitions remain the same) ...

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      // ... (other state and actions remain mostly the same) ...
      
      cleanExpiredContent: () => {
        const now = new Date();
        const { posts, battles } = get();
        
        // 1. First handle battle expirations
        const updatedBattles: Battle[] = [];
        const battleUpdates: Record<string, Battle> = {};
        const postsToUpdate: Record<string, Post> = {};
        
        battles.forEach(battle => {
          if (new Date(battle.expiresAt) <= now && battle.isActive) {
            // Battle expired - determine winner
            const winnerId = battle.originalVotes > battle.challengeVotes 
              ? battle.originalPostId 
              : battle.challengePostId;
            
            // Mark battle as completed
            battleUpdates[battle.id] = {
              ...battle,
              isActive: false,
              winnerId
            };
            
            // Extend winner post lifetime (48 hours)
            postsToUpdate[winnerId] = {
              ...posts.find(p => p.id === winnerId)!,
              expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000)
            };
          }
          // Keep battle if it's either active or recently completed
          if (new Date(battle.expiresAt) > now || 
             (battle.winnerId && new Date(battle.expiresAt).getTime() + 48 * 60 * 60 * 1000 > now.getTime())) {
            updatedBattles.push(battleUpdates[battle.id] || battle);
          }
        });
        
        // 2. Filter expired posts
        const activePosts = posts.filter(post => {
          // Apply winner extension if exists
          if (postsToUpdate[post.id]) {
            return true;
          }
          return new Date(post.expiresAt) > now;
        });
        
        // 3. Update state only if changes exist
        const hasChanges = 
          activePosts.length !== posts.length || 
          updatedBattles.length !== battles.length ||
          Object.keys(postsToUpdate).length > 0 ||
          Object.keys(battleUpdates).length > 0;
        
        if (hasChanges) {
          // Apply post updates for battle winners
          const updatedPosts = activePosts.map(post => 
            postsToUpdate[post.id] || post
          );
          
          set({ 
            posts: updatedPosts,
            battles: updatedBattles 
          }, false);
        }
      },
      
      // ... (other actions) ...
    }),
    {
      name: 'post-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => 
        // Don't persist loading state
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== 'isLoading')
        )
    }
  )
);