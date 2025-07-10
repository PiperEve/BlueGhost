// src/tasks/resetTask.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { checkMonthlyReset } from '../utils/monthlyReset';

const MONTHLY_RESET_TASK = 'monthly-reset-task';

TaskManager.defineTask(MONTHLY_RESET_TASK, async () => {
  try {
    checkMonthlyReset();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerResetTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(MONTHLY_RESET_TASK, {
      minimumInterval: 60 * 60 * 24, // 24 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('[BackgroundTask] Monthly reset task registered');
  } catch (error) {
    console.error('[BackgroundTask] Failed to register task:', error);
  }
};

// Call in your App component
import { registerResetTask } from './tasks/resetTask';

// In App.tsx
useEffect(() => {
  registerResetTask();
}, []);