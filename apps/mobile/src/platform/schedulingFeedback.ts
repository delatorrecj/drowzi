import { Alert, Platform } from 'react-native';

import type { ScheduleAlarmResult } from '@/src/platform/alarmScheduler';

/** Call after `saveAlarm` so the user knows the OS did not enqueue a notification. */
export function notifyIfSchedulingFailed(scheduling: ScheduleAlarmResult): void {
  if (scheduling.ok) return;
  if (scheduling.reason === 'web') return;
  if (scheduling.reason === 'no_triggers') {
    Alert.alert(
      'Alarm not scheduled',
      'That alarm time could not be turned into a repeating notification. Fix the time format and save again.',
    );
    return;
  }

  const androidExtra =
    Platform.OS === 'android'
      ? '\n\nIf notifications are already allowed: open the More tab → “Allow on-time alarms (Android)” and enable Alarms & reminders. After pulling a new native build, reinstall if alarms still do not fire.'
      : '';

  Alert.alert(
    'Alarm not scheduled',
    'Drowzi needs notification permission to fire at your set time. Turn notifications on for Drowzi in system Settings, then save the alarm again.' +
      androidExtra,
  );
}
