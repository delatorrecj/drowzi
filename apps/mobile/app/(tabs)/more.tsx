import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { dashboardTheme } from '@/src/shared/dashboardTheme';
import { openAndroidExactAlarmSettings, openWakeAlarmSoundSettings } from '@/src/platform/openWakeAlarmSoundSettings';

export default function MoreScreen() {
  const [soundHint, setSoundHint] = useState<string | null>(null);
  const [exactHint, setExactHint] = useState<string | null>(null);

  const onAlarmSound = useCallback(async () => {
    setSoundHint(null);
    try {
      await openWakeAlarmSoundSettings();
    } catch {
      setSoundHint('Could not open settings. Try system Settings → Apps → Drowzi → Notifications.');
    }
  }, []);

  const onExactAlarmPermission = useCallback(async () => {
    setExactHint(null);
    try {
      await openAndroidExactAlarmSettings();
      setExactHint('If a toggle appeared, enable it. Then return to Home and check the “Next notification” line on your alarm.');
    } catch {
      setExactHint(
        'Could not open that screen. Try Settings → Apps → Drowzi → Alarms & reminders (name varies by manufacturer).',
      );
    }
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Alarm sound</Text>
      <Text style={styles.body}>
        {Platform.OS === 'android'
          ? 'Opens the “Wake alarms” channel. Choose any system sound — including alarm tones on many phones.'
          : 'iOS does not let third-party apps use the Clock app’s alarm tone for scheduled notifications. You get the default alert sound unless you add a custom sound to the app build. This button opens Drowzi’s settings so you can adjust notifications.'}
      </Text>
      <Pressable style={styles.button} onPress={() => void onAlarmSound()}>
        <Text style={styles.buttonLabel}>Choose alarm / notification sound</Text>
      </Pressable>
      {soundHint ? <Text style={styles.hint}>{soundHint}</Text> : null}

      {Platform.OS === 'android' ? (
        <>
          <Text style={[styles.title, styles.sectionTop]}>Alarms firing late or never?</Text>
          <Text style={styles.body}>
            Some phones block background timers unless “Alarms & reminders” / exact alarms are enabled for this
            app. Use this after you have allowed notifications.
          </Text>
          <Pressable style={styles.button} onPress={() => void onExactAlarmPermission()}>
            <Text style={styles.buttonLabel}>Allow on-time alarms (Android)</Text>
          </Pressable>
          {exactHint ? <Text style={styles.hint}>{exactHint}</Text> : null}
        </>
      ) : null}

      <Text style={[styles.title, styles.sectionTop]}>Developer split</Text>
      <Text style={styles.body}>
        Platform & data: apps/mobile/src/platform — notifications, local persistence (AsyncStorage on device and
        web).
      </Text>
      <Text style={styles.body}>
        Product & gates: apps/mobile/src/features/habits — replace stubs with real sensors / ML Kit.
      </Text>
      <Text style={styles.body}>See docs/plan-dev-workflow-split.md and apps/mobile/CONTRACT.md.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: dashboardTheme.bg,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: dashboardTheme.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: dashboardTheme.textMuted,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: dashboardTheme.primary,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: dashboardTheme.textOnPrimary,
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: dashboardTheme.textMuted,
  },
  sectionTop: {
    marginTop: 28,
  },
});
