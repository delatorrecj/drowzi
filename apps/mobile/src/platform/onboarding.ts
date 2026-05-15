import AsyncStorage from '@react-native-async-storage/async-storage';

import { storageKeys } from '@/src/platform/storage';

export async function isOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(storageKeys.onboardingComplete);
  return v === 'true';
}

export async function setOnboardingComplete(done: boolean): Promise<void> {
  await AsyncStorage.setItem(storageKeys.onboardingComplete, done ? 'true' : 'false');
}
