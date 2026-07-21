import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  ListRenderItem,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useFocusEffect } from 'expo-router';

import type { Alarm } from '@/src/shared/types';
import { AppText, Badge, Button, MascotEvolution, StatCard, color, space } from '@/src/ui';
import { deleteAlarm, getAlarms } from '@/src/platform/alarmStore';
import {
  formatNextAlarmRingSummary,
  isNotificationPermissionGranted,
} from '@/src/platform/alarmScheduler';
import {
  getConsecutiveDayStreak,
  getRecentCompletions,
} from '@/src/platform/recordCompletion';
import {
  getDisplayName,
  isOnboardingComplete,
  markSetupReminderShown,
  resetOnboardingFlagsDev,
  wasAlarmSetupSkipped,
  wasSetupReminderShown,
} from '@/src/platform/onboarding';

function habitLabel(type: Alarm['habitType']): string {
  switch (type) {
    case 'motion':
      return 'Motion';
    case 'barcode':
      return 'Barcode';
    case 'voice':
      return 'Voice';
    case 'pose':
      return 'Pose';
    case 'meditation':
      return 'Meditation';
    default: {
      const _x: never = type;
      return _x;
    }
  }
}

export default function DashboardScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [recentCount, setRecentCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [onboarded, setOnboarded] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [nextRingById, setNextRingById] = useState<Record<string, string>>({});
  const [notificationAllowed, setNotificationAllowed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const [list, recent, done, streakDays, name, notifGranted] = await Promise.all([
      getAlarms(),
      getRecentCompletions(7),
      isOnboardingComplete(),
      getConsecutiveDayStreak(),
      getDisplayName(),
      Platform.OS === 'web' ? Promise.resolve(true) : isNotificationPermissionGranted(),
    ]);
    setAlarms(list);
    setRecentCount(recent.length);
    setOnboarded(done);
    setStreak(streakDays);
    setDisplayName(name);
    setNotificationAllowed(notifGranted);

    if (Platform.OS === 'web') {
      setNextRingById({});
    } else {
      const rings: Record<string, string> = {};
      await Promise.all(
        list.map(async (alarm) => {
          rings[alarm.id] = await formatNextAlarmRingSummary(alarm);
        }),
      );
      setNextRingById(rings);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void refresh().finally(() => setRefreshing(false));
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const skipped = await wasAlarmSetupSkipped();
        const shown = await wasSetupReminderShown();
        if (cancelled || !skipped || shown) return;
        await markSetupReminderShown();
        if (cancelled) return;
        Alert.alert(
          'Finish your alarm setup',
          'You skipped configuring a habit during onboarding. Add your first alarm to use the rest of Drowzi.',
          [
            {
              text: 'Set up now',
              onPress: () => router.push('/add-alarm'),
            },
            { text: 'Later', style: 'cancel' },
          ],
        );
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const header = (
    <View style={styles.headerBlock}>
      {!onboarded ? (
        <View style={styles.banner}>
          <AppText variant="bodyStrong">Finish onboarding</AppText>
          <AppText variant="caption" color={color.textMuted}>
            Complete the welcome flow so your first alarm is saved.
          </AppText>
          <Link href="/onboarding" asChild>
            <Pressable style={styles.bannerCta}>
              <AppText variant="bodyStrong" color={color.textOnPrimary}>
                Continue setup
              </AppText>
            </Pressable>
          </Link>
        </View>
      ) : null}

      {Platform.OS !== 'web' && !notificationAllowed ? (
        <View style={[styles.banner, styles.warnBanner]}>
          <AppText variant="bodyStrong">Notifications are off</AppText>
          <AppText variant="caption" color={color.textMuted}>
            Scheduled alarms cannot fire until the system allows Drowzi to notify you.
          </AppText>
          <Pressable style={styles.bannerCta} onPress={() => void Linking.openSettings()}>
            <AppText variant="bodyStrong" color={color.textOnPrimary}>
              Open system settings
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {displayName ? (
        <View>
          <AppText variant="h2">Morning, {displayName}</AppText>
          <AppText variant="label" color={color.textMuted}>
            Your accountability hub
          </AppText>
        </View>
      ) : (
        <AppText variant="label" color={color.textMuted}>
          Morning accountability
        </AppText>
      )}

      <View style={styles.heroRow}>
        <MascotEvolution streak={streak} />
      </View>

      <View style={styles.statsRow}>
        <StatCard value={streak} label="Day streak" />
        <StatCard value={recentCount} label="Logs (7 days)" />
      </View>

      <View style={styles.sectionHead}>
        <AppText variant="h2">Alarms</AppText>
        <Link href="/add-alarm" asChild>
          <Pressable style={styles.addChip}>
            <AppText variant="bodyStrong" color={color.primary}>
              + Add
            </AppText>
          </Pressable>
        </Link>
      </View>

      <AppText variant="caption" color={color.textMuted}>
        Alarms notify at the clock time below (daily = next occurrence; if today’s time already passed, the next ring
        is usually tomorrow unless you tap Edit). Tap Simulate anytime to practise the gate. Not on web.
      </AppText>
    </View>
  );

  const footer = (
    <View style={styles.footerBlock}>
      <Pressable
        style={styles.reset}
        onPress={async () => {
          await resetOnboardingFlagsDev();
          void refresh();
          router.replace('/');
        }}>
        <AppText variant="caption" color={color.textMuted} style={styles.resetLabel}>
          Reset onboarding (dev)
        </AppText>
      </Pressable>
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      <AppText variant="h3">No alarms yet</AppText>
      <AppText variant="body" color={color.textMuted} style={{ textAlign: 'center' }}>
        Run onboarding or add your first habit alarm.
      </AppText>
      <Link href="/add-alarm" asChild>
        <Button title="Set up first alarm" style={{ marginTop: space[2] }} />
      </Link>
    </View>
  );

  const renderItem: ListRenderItem<Alarm> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <AppText variant="h1" style={styles.time}>
          {item.time}
        </AppText>
        <Badge label={habitLabel(item.habitType)} />
      </View>
      <AppText variant="bodyStrong" color={color.primary} style={styles.nextRing}>
        {nextRingById[item.id] ?? '—'}
      </AppText>
      <AppText variant="caption" color={color.textMuted} style={{ textTransform: 'capitalize' }}>
        {item.recurrence.type} · tap Simulate to practise the gate now
      </AppText>
      <AppText variant="caption" color={color.text}>
        Edit time & reps, or remove this alarm.
      </AppText>
      <View style={styles.cardActions}>
        <Pressable
          style={styles.editAction}
          accessibilityRole="button"
          accessibilityLabel={`Edit alarm ${item.time}`}
          onPress={() => router.push({ pathname: '/add-alarm', params: { id: item.id } })}>
          <AppText variant="bodyStrong" color={color.primary}>
            Edit alarm
          </AppText>
        </Pressable>
        <Pressable
          style={styles.deleteAction}
          accessibilityRole="button"
          accessibilityLabel={`Delete alarm ${item.time}`}
          onPress={() =>
            Alert.alert('Delete alarm', `Remove the ${item.time} alarm?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => void deleteAlarm(item.id).then(() => refresh()),
              },
            ])
          }>
          <AppText variant="bodyStrong" color={color.alarmAccent}>
            Delete
          </AppText>
        </Pressable>
      </View>
      <Pressable style={styles.simulate} onPress={() => router.push(`/habit-gate/${item.id}`)}>
        <AppText variant="bodyStrong" color={color.textOnPrimary}>
          Simulate alarm
        </AppText>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[styles.scroll, alarms.length === 0 && styles.scrollEmpty]}
        data={alarms}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={renderItem}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={color.primary}
              colors={[color.primary]}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  screen: { flex: 1, backgroundColor: color.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  scrollEmpty: { flexGrow: 1 },
  headerBlock: { gap: 16, paddingBottom: 20 },
  footerBlock: { paddingTop: 24, gap: 10 },
  banner: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 8,
  },
  bannerCta: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: color.primary,
  },
  warnBanner: { borderWidth: 1, borderColor: color.alarmAccent },
  heroRow: { alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 12 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.primary,
  },
  empty: { paddingVertical: 28, paddingHorizontal: 8, gap: 12, alignItems: 'center' },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  time: { fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  nextRing: { marginTop: 6, fontSize: 13 },
  cardActions: { flexDirection: 'row', flexWrap: 'nowrap', gap: 10, marginTop: 10 },
  editAction: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 196, 48, 0.14)',
    borderWidth: 2,
    borderColor: color.primary,
  },
  deleteAction: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(230, 57, 70, 0.12)',
    borderWidth: 2,
    borderColor: color.alarmAccent,
  },
  simulate: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: color.primary,
    borderWidth: 2,
    borderColor: color.textOnPrimary,
  },
  reset: { paddingVertical: 12, alignItems: 'center' },
  resetLabel: { textDecorationLine: 'underline' },
});
