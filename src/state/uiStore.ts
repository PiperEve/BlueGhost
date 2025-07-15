import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UIState {
  theme: 'dark' | 'light';
  isSubscribed: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  toggleSubscription: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      isSubscribed: false,

      setTheme: (theme) => set({ theme }),
      toggleSubscription: () => set((state) => ({ isSubscribed: !state.isSubscribed })),
    }),
    {
      name: 'ui-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);