// src/state/postStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Post {
  id: string;
  userId: string;
  username: string; // Anonymous name like "WingedRabbit42"
  content: string;
  voiceNoteUri?: string;
  voiceNoteDuration?: number;
  musicTrackId?: string;
  musicDuration?: number;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  createdAt: Date;
  expiresAt: Date;
  folderId?: string;
  isInBattle: boolean;
  battleId?: string;
  ventTheme?: string;
}

export interface Battle {
  id: string;
  originalPostId: string;
  challengePostId: string;
  originalVotes: number;
  challengeVotes: number;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  winnerId?: string;
}

export interface Folder {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  memberCount: number;
  postCount: number;
  createdAt: Date;
}

interface PostState {
  posts: Post[];
  battles: Battle[];
  folders: Folder[];
  isLoading: boolean;
  
  // Post actions
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'expiresAt'>) => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => void;
  dislikePost: (postId: string) => void;
  
  // Battle actions
  createBattle: (originalPostId: string, challengePost: Omit<Post, 'id' | 'createdAt' | 'expiresAt'>) => void;
  voteInBattle: (battleId: string, side: 'original' | 'challenge') => void;
  
  // Folder actions
  createFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => void;
  joinFolder: (folderId: string) => void;
  
  // Utility
  getActivePosts: () => Post[];
  getActiveBattles: () => Battle[];
  cleanExpiredContent: () => void;
}

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: [],
      battles: [],
      folders: [],
      isLoading: false,
      
      addPost: (postData) => {
        const now = new Date();
        const post: Post = {
          ...postData,
          id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
        };
        
        set((state) => ({
          posts: [post, ...state.posts]
        }));
      },
      
      deletePost: (postId) => {
        set((state) => ({
          posts: state.posts.filter(p => p.id !== postId)
        }));
      },
      
      likePost: (postId) => {
        set((state) => ({
          posts: state.posts.map(p => 
            p.id === postId 
              ? { 
                  ...p, 
                  likes: p.userLiked ? p.likes - 1 : p.likes + 1,
                  dislikes: p.userDisliked ? p.dislikes - 1 : p.dislikes,
                  userLiked: !p.userLiked,
                  userDisliked: false
                } 
              : p
          )
        }));
      },
      
      dislikePost: (postId) => {
        set((state) => ({
          posts: state.posts.map(p => 
            p.id === postId 
              ? { 
                  ...p, 
                  dislikes: p.userDisliked ? p.dislikes - 1 : p.dislikes + 1,
                  likes: p.userLiked ? p.likes - 1 : p.likes,
                  userDisliked: !p.userDisliked,
                  userLiked: false
                } 
              : p
          )
        }));
      },
      
      createBattle: (originalPostId, challengePostData) => {
        const now = new Date();
        const challengePost: Post = {
          ...challengePostData,
          id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          isInBattle: true,
        };
        
        const battle: Battle = {
          id: `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalPostId,
          challengePostId: challengePost.id,
          originalVotes: 0,
          challengeVotes: 0,
          createdAt: now,
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          isActive: true,
        };
        
        set((state) => ({
          posts: [challengePost, ...state.posts.map(p => 
            p.id === originalPostId ? { ...p, isInBattle: true, battleId: battle.id } : p
          )],
          battles: [battle, ...state.battles]
        }));
      },
      
      voteInBattle: (battleId, side) => {
        set((state) => ({
          battles: state.battles.map(b => 
            b.id === battleId 
              ? {
                  ...b,
                  originalVotes: side === 'original' ? b.originalVotes + 1 : b.originalVotes,
                  challengeVotes: side === 'challenge' ? b.challengeVotes + 1 : b.challengeVotes,
                }
              : b
          )
        }));
      },
      
      createFolder: (folderData) => {
        const folder: Folder = {
          ...folderData,
          id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };
        
        set((state) => ({
          folders: [folder, ...state.folders]
        }));
      },
      
      joinFolder: (folderId) => {
        set((state) => ({
          folders: state.folders.map(f => 
            f.id === folderId 
              ? { ...f, memberCount: f.memberCount + 1 }
              : f
          )
        }));
      },
      
      getActivePosts: () => {
        const now = new Date();
        return get().posts.filter(p => new Date(p.expiresAt) > now);
      },
      
      getActiveBattles: () => {
        const now = new Date();
        return get().battles.filter(b => new Date(b.expiresAt) > now && b.isActive);
      },
      
      cleanExpiredContent: () => {
        const now = new Date();
        const currentState = get();
        const filteredPosts = currentState.posts.filter(p => new Date(p.expiresAt) > now);
        const filteredBattles = currentState.battles.filter(b => new Date(b.expiresAt) > now);
        
        // Only update if there are actually items to remove
        if (filteredPosts.length !== currentState.posts.length || filteredBattles.length !== currentState.battles.length) {
          set({
            posts: filteredPosts,
            battles: filteredBattles
          }, false); // Don't notify subscribers to prevent infinite loops
        }
      },
    }),
    {
      name: 'post-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);




///delete
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