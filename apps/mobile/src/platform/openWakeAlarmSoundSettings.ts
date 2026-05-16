import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, Platform } from 'react-native';

import { ANDROID_ALARM_CHANNEL_ID } from '@/src/platform/notificationChannel';

/**
 * Opens OS UI so the user can pick any built-in tone (including alarm tones on many devices).
 *
 * **Android:** Deep-links to this app’s “Wake alarms” notification channel sound picker (API 26+).
 * **iOS:** Apple does not expose the Clock app’s alarm tone to third-party notification APIs; we open
 * the app’s Settings screen so the user can adjust what the system allows.
 */
export async function openWakeAlarmSoundSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    const packageName = Application.applicationId;
    if (!packageName) {
      await Linking.openSettings();
      return;
    }

    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.CHANNEL_NOTIFICATION_SETTINGS,
        {
          extra: {
            'android.provider.extra.APP_PACKAGE': packageName,
            'android.provider.extra.CHANNEL_ID': ANDROID_ALARM_CHANNEL_ID,
          },
        },
      );
    } catch {
      await Linking.openSettings();
    }
    return;
  }

  await Linking.openSettings();
}

/**
 * Android 12+: request the “Alarms & reminders” / exact-alarm capability so daily triggers fire on time.
 */
export async function openAndroidExactAlarmSettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    await Linking.openSettings();
    return;
  }
  const packageName = Application.applicationId;
  if (!packageName) {
    await Linking.openSettings();
    return;
  }
  try {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM, {
      data: `package:${packageName}`,
    });
  } catch {
    await Linking.openSettings();
  }
}
