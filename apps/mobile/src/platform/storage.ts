const PREFIX = '@drowzi/';

export const storageKeys = {
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
