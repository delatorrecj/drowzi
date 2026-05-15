import type { Alarm } from '@/src/shared/types';

/**
 * Wire to expo-notifications (or native alarms). Until then, use the in-app
 * "Simulate alarm" entry from Home — docs/plan-dev-workflow-split.md hackathon fallback.
 */
export async function scheduleAlarm(_alarm: Alarm): Promise<void> {
  // TODO: expo-notifications scheduleTriggerNotificationAsync
}

export async function cancelAlarm(_alarmId: string): Promise<void> {
  // TODO: cancel scheduled notifications for alarm id
}
