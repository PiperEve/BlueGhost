// src/state/rootStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RootStore {
  lastMonthlyReset: string;
  appLaunchCount: number;
  setLastResetDate: (date: string) => void;
  incrementLaunchCount: () => void;
}

export const useRootStore = create<RootStore>()(
  persist(
    (set, get) => ({
      lastMonthlyReset: new Date().toISOString().slice(0, 7), // "2025-07"
      appLaunchCount: 0,
      
      setLastResetDate: (date) => set({ lastMonthlyReset: date }),
      
      incrementLaunchCount: () => 
        set(state => ({ appLaunchCount: state.appLaunchCount + 1 })),
    }),
    {
      name: "root-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Monthly reset helper
export const checkMonthlyReset = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const rootStore = useRootStore.getState();
  
  if (rootStore.lastMonthlyReset !== currentMonth) {
    // Trigger reset in all stores that need monthly resets
    useRewindStore.getState().resetMonthlyRewinds();
    rootStore.setLastResetDate(currentMonth);
  }
};