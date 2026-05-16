import {
  DEFAULT_ACTION_IDENTIFIER,
  clearLastNotificationResponse,
} from 'expo-notifications/build/NotificationsEmitter';
import useLastNotificationResponse from 'expo-notifications/build/useLastNotificationResponse';
import type { NotificationResponse } from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

type AlarmPayload = {
  type?: string;
  url?: unknown;
  alarmId?: unknown;
};

function habitGateHref(response: NotificationResponse): Href | null {
  if (response.actionIdentifier !== DEFAULT_ACTION_IDENTIFIER) return null;

  const data = response.notification.request.content.data as AlarmPayload | undefined;
  if (data?.type !== 'drowzi-alarm') return null;

  if (typeof data.url === 'string' && data.url.startsWith('/')) {
    return data.url as Href;
  }
  if (typeof data.alarmId === 'string' && data.alarmId.length > 0) {
    return `/habit-gate/${data.alarmId}` as Href;
  }
  return null;
}

/**
 * Opens the habit gate when the user taps a scheduled alarm notification,
 * including cold-start from a dismissed notification.
 *
 * Uses `useLastNotificationResponse` so startup handling matches expo-notifications
 * (layout-effect subscription + initial `getLastNotificationResponse`).
 */
export function useAlarmNotificationResponse(): void {
  const router = useRouter();
  const lastResponse = useLastNotificationResponse();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (lastResponse === undefined || lastResponse === null) return;

    const href = habitGateHref(lastResponse);
    if (!href) return;

    router.push(href);
    clearLastNotificationResponse();
  }, [router, lastResponse]);
}
