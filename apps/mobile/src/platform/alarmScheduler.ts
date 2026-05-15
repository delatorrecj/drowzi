import { Platform } from 'react-native';
import cancelScheduledNotificationAsync from 'expo-notifications/build/cancelScheduledNotificationAsync';
import getAllScheduledNotificationsAsync from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import {
  AndroidAudioContentType,
  AndroidAudioUsage,
  AndroidImportance,
  AndroidNotificationVisibility,
} from 'expo-notifications/build/NotificationChannelManager.types';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  AndroidNotificationPriority,
  SchedulableTriggerInputTypes,
} from 'expo-notifications/build/Notifications.types';
import scheduleNotificationAsync from 'expo-notifications/build/scheduleNotificationAsync';
import setNotificationChannelAsync from 'expo-notifications/build/setNotificationChannelAsync';
import type { NotificationContentInput, SchedulableNotificationTriggerInput } from 'expo-notifications';

import type { Alarm } from '@/src/shared/types';

/** Must match app.json expo-notifications `defaultChannel` (Android fallback). */
export const ANDROID_ALARM_CHANNEL_ID = 'drowzi-alarm-v1';

let androidChannelEnsured = false;
let foregroundHandlerEnsured = false;

function ensureForegroundHandler(): void {
  if (Platform.OS === 'web' || foregroundHandlerEnsured) return;
  foregroundHandlerEnsured = true;
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidAlarmChannel(): Promise<void> {
  if (Platform.OS !== 'android' || androidChannelEnsured) return;
  androidChannelEnsured = true;
  await setNotificationChannelAsync(ANDROID_ALARM_CHANNEL_ID, {
    name: 'Wake alarms',
    importance: AndroidImportance.MAX,
    description:
      'Habit-gated wake reminders. Open sound settings from the More tab to use your phone’s alarm or ringtone list.',
    enableLights: true,
    enableVibrate: true,
    vibrationPattern: [0, 400, 200, 400, 200, 600],
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    audioAttributes: {
      usage: AndroidAudioUsage.ALARM,
      contentType: AndroidAudioContentType.SONIFICATION,
      flags: {
        enforceAudibility: true,
        requestHardwareAudioVideoSynchronization: false,
      },
    },
  });
}

function parseTimeParts(time: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function parseIsoDate(date: string): { y: number; m: number; d: number } | null {
  const x = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!x) return null;
  const y = Number(x[1]);
  const m = Number(x[2]);
  const d = Number(x[3]);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

function triggersFor(alarm: Alarm): SchedulableNotificationTriggerInput[] {
  const t = parseTimeParts(alarm.time);
  if (!t) return [];
  const { hour, minute } = t;
  const channelId =
    Platform.OS === 'android' ? ANDROID_ALARM_CHANNEL_ID : undefined;

  switch (alarm.recurrence.type) {
    case 'daily':
      return [
        {
          type: SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId,
        },
      ];
    case 'weekdays':
      return [2, 3, 4, 5, 6].map((weekday) => ({
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId,
      }));
    case 'weekly':
      return alarm.recurrence.days.map((weekday) => ({
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId,
      }));
    case 'once': {
      const parts = parseIsoDate(alarm.recurrence.date);
      if (!parts) return [];
      const fireAt = new Date(parts.y, parts.m - 1, parts.d, hour, minute, 0, 0);
      if (fireAt.getTime() <= Date.now()) return [];
      return [
        {
          type: SchedulableTriggerInputTypes.DATE,
          date: fireAt,
          channelId,
        },
      ];
    }
    default:
      return [];
  }
}

function alarmNotificationContent(alarm: Alarm): NotificationContentInput {
  const url = `/habit-gate/${alarm.id}`;
  return {
    title: 'Drowzi — Wake habit',
    subtitle: alarm.time,
    body: 'Tap to prove you’re awake and complete your habit toll.',
    /** Default notification sound; on Android the channel’s user-selected tone (see More → sound) wins on 8+. */
    sound: true,
    priority: AndroidNotificationPriority.MAX,
    vibrate: [0, 400, 200, 400, 200, 600],
    data: {
      type: 'drowzi-alarm',
      alarmId: alarm.id,
      url,
    },
    ...(Platform.OS === 'ios'
      ? { interruptionLevel: 'active' as const }
      : {}),
  };
}

/**
 * Registers permission + alarm channel helpers. Safe to call on every save.
 */
export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  ensureForegroundHandler();
  await ensureAndroidAlarmChannel();

  const existing = await getPermissionsAsync();
  if (existing.granted) return true;

  const next = await requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return next.granted;
}

/** Cancel scheduled local notifications tied to `alarmId` (by payload). */
export async function cancelAlarm(alarmId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  ensureForegroundHandler();

  const scheduled = await getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled.map(async (req) => {
      const raw = req.content.data as { alarmId?: string; type?: string } | undefined;
      if (raw?.type === 'drowzi-alarm' && raw.alarmId === alarmId) {
        await cancelScheduledNotificationAsync(req.identifier);
      }
    }),
  );
}

export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  if (Platform.OS === 'web') return;

  ensureForegroundHandler();
  await ensureAndroidAlarmChannel();

  await cancelAlarm(alarm.id);

  const ok = await ensureNotificationPermissions();
  if (!ok) {
    console.warn('[alarmScheduler] notification permission not granted; alarm not scheduled');
    return;
  }

  const triggers = triggersFor(alarm);
  if (triggers.length === 0) {
    console.warn('[alarmScheduler] no valid triggers for alarm', alarm.id);
    return;
  }

  await Promise.all(
    triggers.map((trigger, idx) =>
      scheduleNotificationAsync({
        identifier: `drowzi-scheduled-${alarm.id}-${idx}`,
        content: alarmNotificationContent(alarm),
        trigger,
      }),
    ),
  );
}
