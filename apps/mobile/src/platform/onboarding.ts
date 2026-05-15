import AsyncStorage from '@react-native-async-storage/async-storage';

import { storageKeys } from '@/src/platform/storage';

export async function isOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(storageKeys.onboardingComplete);
  return v === 'true';
}

export async function setOnboardingComplete(done: boolean): Promise<void> {
  await AsyncStorage.setItem(storageKeys.onboardingComplete, done ? 'true' : 'false');
}

export async function setAlarmSetupSkipped(skipped: boolean): Promise<void> {
  await AsyncStorage.setItem(storageKeys.alarmSetupSkipped, skipped ? 'true' : 'false');
}

export async function wasAlarmSetupSkipped(): Promise<boolean> {
  return (await AsyncStorage.getItem(storageKeys.alarmSetupSkipped)) === 'true';
}

export async function markSetupReminderShown(): Promise<void> {
  await AsyncStorage.setItem(storageKeys.setupReminderShown, 'true');
}

export async function wasSetupReminderShown(): Promise<boolean> {
  return (await AsyncStorage.getItem(storageKeys.setupReminderShown)) === 'true';
}

/** After user saves their first alarm from onboarding (PRD US-05 happy path). */
export async function clearAlarmSetupSkipFlags(): Promise<void> {
  await AsyncStorage.multiRemove([storageKeys.alarmSetupSkipped, storageKeys.setupReminderShown]);
}

/** Dev / QA — wipe onboarding + skip reminder flags (does not delete alarms). */
export async function resetOnboardingFlagsDev(): Promise<void> {
  await AsyncStorage.multiRemove([
    storageKeys.onboardingComplete,
    storageKeys.alarmSetupSkipped,
    storageKeys.setupReminderShown,
  ]);
}
