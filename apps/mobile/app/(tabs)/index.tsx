import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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
import { AppText, Badge, EmptyState, Icon, MascotEvolution, StatCard, color } from '@/src/ui';
import { deleteAlarm, getAlarms } from '@/src/platform/alarmStore';
import {
  formatNextAlarmRingSummary,
  isNotificationPermissionGranted,
} from '@/src/platform/alarmScheduler';
import { getDashboardStats, type DashboardStats } from '@/src/platform/recordCompletion';
import {
  getDisplayName,
  isOnboardingComplete,
  markSetupReminderShown,
  resetOnboardingFlagsDev,
  wasAlarmSetupSkipped,
  wasSetupReminderShown,
} from '@/src/platform/onboarding';
import {
  PRACTICE_GATE_LINKS,
  PRACTICE_TEST_ALARM_ID,
} from '@/src/features/practice/practiceDefaults';
import { mascotAssets } from '@/assets/images/mascot';

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

const EMPTY_STATS: DashboardStats = {
  totalCompleted: 0,
  successRate: null,
  streak: 0,
  week: [],
};

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** localDate (YYYY-MM-DD) → single weekday initial. */
function weekdayInitial(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  return WEEKDAY_INITIALS[new Date(y, (m ?? 1) - 1, d ?? 1).getDay()];
}

export default function DashboardScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [onboarded, setOnboarded] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [nextRingById, setNextRingById] = useState<Record<string, string>>({});
  const [notificationAllowed, setNotificationAllowed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const [list, dashStats, done, name, notifGranted] = await Promise.all([
      getAlarms(),
      getDashboardStats(),
      isOnboardingComplete(),
      getDisplayName(),
      Platform.OS === 'web' ? Promise.resolve(true) : isNotificationPermissionGranted(),
    ]);
    setAlarms(list.filter((a) => a.id !== PRACTICE_TEST_ALARM_ID && !a.id.startsWith('practice-')));
    setStats(dashStats);
    setOnboarded(done);
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
        <MascotEvolution streak={stats.streak} />
      </View>

      <View style={styles.statsRow}>
        <StatCard value={stats.streak} label="Streak" />
        <StatCard value={stats.totalCompleted} label="Completed" />
        <StatCard value={stats.successRate === null ? '—' : `${stats.successRate}%`} label="Success" />
      </View>

      <View style={styles.weekCard}>
        <AppText variant="label" color={color.textMuted}>
          This week
        </AppText>
        <View style={styles.weekRow}>
          {stats.week.map((day) => (
            <View key={day.date} style={styles.weekCell}>
              <View style={[styles.weekDot, day.done && styles.weekDotDone]}>
                {day.done ? (
                  <Image source={mascotAssets.mascot} style={styles.weekMascot} resizeMode="contain" />
                ) : null}
              </View>
              <AppText variant="caption" color={color.textMuted}>
                {weekdayInitial(day.date)}
              </AppText>
            </View>
          ))}
        </View>
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
      <AppText variant="h2">Practice habit gates</AppText>
      <AppText variant="caption" color={color.textMuted}>
        Try each verification mode without waiting for a wake alarm. Camera and mic stay on your device.
      </AppText>
      {PRACTICE_GATE_LINKS.map((g) => {
        const iconName =
          g.href === '/practice/motion'
            ? 'motion'
            : g.href === '/practice/barcode'
              ? 'barcode'
              : g.href === '/practice/voice'
                ? 'voice'
                : 'alarm-bell';
        return (
          <Pressable
            key={String(g.href)}
            style={styles.practiceRow}
            onPress={() => router.push(g.href)}>
            <View style={styles.practiceIcon}>
              <Icon name={iconName} size={20} stroke={color.primary} />
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
        );
      })}

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
    <EmptyState
      icon="alarm-bell"
      title="No alarms yet"
      body="Run onboarding or add your first habit alarm to wake up accountable."
      cta={{ label: 'Set up first alarm', onPress: () => router.push('/add-alarm') }}
    />
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
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  practiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.bg,
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
  weekCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 12,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekCell: { alignItems: 'center', gap: 6 },
  weekDot: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.border,
  },
  weekDotDone: { backgroundColor: color.primary, borderColor: color.primary },
  weekMascot: { width: 28, height: 28 },
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
