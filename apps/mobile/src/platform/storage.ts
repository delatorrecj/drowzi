import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@drowzi/';

export const storageKeys = {
  /** Top-level persisted-schema version — bump when alarm/log array shapes change. */
  schemaVersion: `${PREFIX}schema_version`,
  onboardingComplete: `${PREFIX}onboarding_complete`,
  /** User left onboarding without saving an alarm (PRD US-05 skip path). */
  alarmSetupSkipped: `${PREFIX}alarm_setup_skipped`,
  /** One-time home prompt for skipped setup has been shown. */
  setupReminderShown: `${PREFIX}setup_reminder_shown`,
  /** Trimmed display name from onboarding (dashboard greeting). */
  displayName: `${PREFIX}display_name`,
  /** Furthest onboarding screen reached (1 name, 2 alarm); absent = welcome. */
  onboardingResumeScreen: `${PREFIX}onboarding_resume_screen`,
  alarms: `${PREFIX}alarms`,
  habitLogs: `${PREFIX}habit_logs`,
} as const;

export const STORAGE_SCHEMA_VERSION = 1;

/**
 * Run at startup. Reads the stored schema version and applies array-shape
 * migrations for alarms/logs. v0→1 is a no-op (existing keys already match v1);
 * this is the hook so a future breaking shape change has somewhere to live.
 * ponytail: sequential if-ladder, fine until there are many versions.
 */
export async function runStorageMigrations(): Promise<void> {
  const raw = await AsyncStorage.getItem(storageKeys.schemaVersion);
  const version = raw ? Number(raw) : 0;
  if (version >= STORAGE_SCHEMA_VERSION) return;
  // (add `if (version < N) { …transform… }` steps here as the shape evolves)
  await AsyncStorage.setItem(storageKeys.schemaVersion, String(STORAGE_SCHEMA_VERSION));
}
