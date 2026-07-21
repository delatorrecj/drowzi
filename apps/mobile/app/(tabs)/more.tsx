import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppText, Button, Card, Icon, color, space } from '@/src/ui';
import { openAndroidExactAlarmSettings, openWakeAlarmSoundSettings } from '@/src/platform/openWakeAlarmSoundSettings';
import { PRACTICE_GATE_LINKS } from '@/src/features/practice/practiceDefaults';
import { resetOnboardingFlagsDev } from '@/src/platform/onboarding';

function practiceIconName(href: string): React.ComponentProps<typeof Icon>['name'] {
  switch (href) {
    case '/practice/motion':
      return 'motion';
    case '/practice/barcode':
      return 'barcode';
    case '/practice/voice':
      return 'voice';
    default:
      return 'alarm-bell';
  }
}

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
            <Icon name="motion" size={20} stroke={color.primary} />
          </View>
          <AppText variant="h3">Practice habit gates</AppText>
        </View>
        <AppText variant="body" color={color.textMuted}>
          Try each verification mode without waiting for a wake alarm. Camera and mic stay on your device.
        </AppText>
        {PRACTICE_GATE_LINKS.map((g) => (
          <Pressable key={String(g.href)} style={styles.practiceRow} onPress={() => router.push(g.href)}>
            <View style={styles.practiceIcon}>
              <Icon name={practiceIconName(String(g.href))} size={20} stroke={color.primary} />
            </View>
            <View style={styles.practiceCopy}>
              <View style={styles.practiceTitleRow}>
                <AppText variant="bodyStrong">{g.title}</AppText>
                <View style={styles.metaChip}>
                  <AppText variant="caption" color={color.primary} style={styles.metaChipText}>
                    {g.meta}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color={color.textMuted}>
                {g.desc}
              </AppText>
            </View>
          </Pressable>
        ))}
      </Card>

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
        <Pressable
          style={styles.reset}
          onPress={async () => {
            await resetOnboardingFlagsDev();
            router.replace('/');
          }}>
          <AppText variant="caption" color={color.textMuted} style={styles.resetLabel}>
            Reset onboarding (dev)
          </AppText>
        </Pressable>
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
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: 14,
    borderRadius: 16,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.border,
  },
  practiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  practiceCopy: { flex: 1, gap: 4 },
  practiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(244, 196, 48, 0.15)',
  },
  metaChipText: { fontSize: 10, fontWeight: '700' },
  reset: { paddingVertical: 12, alignItems: 'center' },
  resetLabel: { textDecorationLine: 'underline' },
});
