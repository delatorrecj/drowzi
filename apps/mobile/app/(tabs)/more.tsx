import { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText, Button, color } from '@/src/ui';
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
      <AppText variant="h3">Alarm sound</AppText>
      <AppText variant="body" color={color.textMuted}>
        {Platform.OS === 'android'
          ? 'Opens the “Wake alarms” channel. Choose any system sound — including alarm tones on many phones.'
          : 'iOS does not let third-party apps use the Clock app’s alarm tone for scheduled notifications. You get the default alert sound unless you add a custom sound to the app build. This button opens Drowzi’s settings so you can adjust notifications.'}
      </AppText>
      <Button title="Choose alarm / notification sound" style={styles.button} onPress={() => void onAlarmSound()} />
      {soundHint ? (
        <AppText variant="caption" color={color.textMuted}>
          {soundHint}
        </AppText>
      ) : null}

      {Platform.OS === 'android' ? (
        <>
          <AppText variant="h3" style={styles.sectionTop}>
            Alarms firing late or never?
          </AppText>
          <AppText variant="body" color={color.textMuted}>
            Some phones block background timers unless “Alarms & reminders” / exact alarms are enabled for this
            app. Use this after you have allowed notifications.
          </AppText>
          <Button title="Allow on-time alarms (Android)" style={styles.button} onPress={() => void onExactAlarmPermission()} />
          {exactHint ? (
            <AppText variant="caption" color={color.textMuted}>
              {exactHint}
            </AppText>
          ) : null}
        </>
      ) : null}

      <AppText variant="h3" style={styles.sectionTop}>
        Developer split
      </AppText>
      <AppText variant="body" color={color.textMuted}>
        Platform & data: apps/mobile/src/platform — notifications, local persistence (AsyncStorage on device and
        web).
      </AppText>
      <AppText variant="body" color={color.textMuted}>
        Product & gates: apps/mobile/src/features/habits — replace stubs with real sensors / ML Kit.
      </AppText>
      <AppText variant="body" color={color.textMuted}>
        See docs/plan-dev-workflow-split.md and apps/mobile/CONTRACT.md.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: color.bg, gap: 12 },
  button: { alignSelf: 'flex-start', marginTop: 8 },
  sectionTop: { marginTop: 28 },
});
