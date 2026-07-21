import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Icon, color, space } from '@/src/ui';
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppText variant="h2">Settings</AppText>

      <Card style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.iconTile}>
            <Icon name="alarm-bell" size={20} stroke={color.primary} />
          </View>
          <AppText variant="h3">Alarm sound</AppText>
        </View>
        <AppText variant="body" color={color.textMuted}>
          {Platform.OS === 'android'
            ? 'Opens the “Wake alarms” channel. Choose any system sound — including alarm tones on many phones.'
            : 'iOS does not let third-party apps use the Clock app’s alarm tone for scheduled notifications. You get the default alert sound unless a custom sound is added to the app build. This opens Drowzi’s notification settings.'}
        </AppText>
        <Button title="Choose alarm / notification sound" style={styles.button} onPress={() => void onAlarmSound()} />
        {soundHint ? (
          <AppText variant="caption" color={color.textMuted}>
            {soundHint}
          </AppText>
        ) : null}
      </Card>

      {Platform.OS === 'android' ? (
        <Card style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconTile}>
              <Icon name="snooze" size={20} stroke={color.primary} />
            </View>
            <AppText variant="h3">On-time alarms</AppText>
          </View>
          <AppText variant="body" color={color.textMuted}>
            Some phones block background timers unless “Alarms & reminders” / exact alarms are enabled for this app.
            Use this after allowing notifications.
          </AppText>
          <Button title="Allow on-time alarms" style={styles.button} onPress={() => void onExactAlarmPermission()} />
          {exactHint ? (
            <AppText variant="caption" color={color.textMuted}>
              {exactHint}
            </AppText>
          ) : null}
        </Card>
      ) : null}

      <Card style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.iconTile}>
            <Icon name="puzzle" size={20} stroke={color.textMuted} />
          </View>
          <AppText variant="h3" color={color.textMuted}>
            Developer notes
          </AppText>
        </View>
        <AppText variant="caption" color={color.textMuted}>
          Platform & data — apps/mobile/src/platform: notifications and local persistence (AsyncStorage on device and web).
        </AppText>
        <AppText variant="caption" color={color.textMuted}>
          Product & gates — apps/mobile/src/features/habits: verification gates and sensor/ML pipelines.
        </AppText>
        <AppText variant="caption" color={color.textMuted}>
          See docs/plan-dev-workflow-split.md and apps/mobile/CONTRACT.md.
        </AppText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { padding: 20, gap: space[4] },
  card: { gap: space[3] },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.border,
  },
  button: { alignSelf: 'flex-start' },
});
