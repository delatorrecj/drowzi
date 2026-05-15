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

export async function getDisplayName(): Promise<string> {
  const raw = await AsyncStorage.getItem(storageKeys.displayName);
  return raw?.trim() ?? '';
}

export async function setDisplayName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (trimmed === '') {
    await AsyncStorage.removeItem(storageKeys.displayName);
    return;
  }
  await AsyncStorage.setItem(storageKeys.displayName, trimmed);
}

/** Restores name (1) or alarm (2) step when returning via `/onboarding` without query params. */
export async function getSavedOnboardingScreen(): Promise<1 | 2 | null> {
  const v = await AsyncStorage.getItem(storageKeys.onboardingResumeScreen);
  if (v === '1') return 1;
  if (v === '2') return 2;
  return null;
}

export async function setSavedOnboardingScreen(screen: 1 | 2): Promise<void> {
  await AsyncStorage.setItem(storageKeys.onboardingResumeScreen, String(screen));
}

export async function clearSavedOnboardingScreen(): Promise<void> {
  await AsyncStorage.removeItem(storageKeys.onboardingResumeScreen);
}

/** Dev / QA — wipe onboarding + skip reminder flags (does not delete alarms). */
export async function resetOnboardingFlagsDev(): Promise<void> {
  await AsyncStorage.multiRemove([
    storageKeys.onboardingComplete,
    storageKeys.alarmSetupSkipped,
    storageKeys.setupReminderShown,
    storageKeys.displayName,
    storageKeys.onboardingResumeScreen,
  ]);
}
