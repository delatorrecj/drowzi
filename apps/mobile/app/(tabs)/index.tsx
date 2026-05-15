import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useFocusEffect } from 'expo-router';

import type { Alarm } from '@/src/shared/types';
import { palette } from '@/src/shared/theme';
import { dashboardTheme } from '@/src/shared/dashboardTheme';
import { DashboardMascotPlaceholder } from '@/src/features/dashboard/DashboardMascotPlaceholder';
import { deleteAlarm, getAlarms } from '@/src/platform/alarmStore';
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

  const refresh = useCallback(async () => {
    const [list, recent, done, streakDays, name] = await Promise.all([
      getAlarms(),
      getRecentCompletions(7),
      isOnboardingComplete(),
      getConsecutiveDayStreak(),
      getDisplayName(),
    ]);
    setAlarms(list);
    setRecentCount(recent.length);
    setOnboarded(done);
    setStreak(streakDays);
    setDisplayName(name);
  }, []);

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

  const mascotMood = streak >= 7 ? 'steady' : 'sleepy';

  const header = (
    <View style={styles.headerBlock}>
      {!onboarded ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Finish onboarding</Text>
          <Text style={styles.bannerBody}>Complete the welcome flow so your first alarm is saved.</Text>
          <Link href="/onboarding" asChild>
            <Pressable style={styles.bannerCta}>
              <Text style={styles.bannerCtaLabel}>Continue setup</Text>
            </Pressable>
          </Link>
        </View>
      ) : null}

      {displayName ? (
        <>
          <Text style={styles.greetingPersonal}>Morning, {displayName}</Text>
          <Text style={styles.greetingSub}>Your accountability hub</Text>
        </>
      ) : (
        <Text style={styles.greeting}>Morning accountability</Text>
      )}

      <View style={styles.heroRow}>
        <DashboardMascotPlaceholder mood={mascotMood} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{recentCount}</Text>
          <Text style={styles.statLabel}>Logs (7 days)</Text>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.h1}>Alarms</Text>
        <Link href="/add-alarm" asChild>
          <Pressable style={styles.addChip}>
            <Text style={styles.addChipLabel}>+ Add</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.lede}>
        New alarms are motion-only for now. Tap Simulate to open the habit gate. Everything stays on this device
        (and in the browser build via local storage).
      </Text>
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
        <Text style={styles.resetLabel}>Reset onboarding (dev)</Text>
      </Pressable>
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No alarms yet</Text>
      <Text style={styles.emptyBody}>Run onboarding or add your first habit alarm.</Text>
      <Link href="/add-alarm" asChild>
        <Pressable style={styles.emptyCta}>
          <Text style={styles.emptyCtaLabel}>Set up first alarm</Text>
        </Pressable>
      </Link>
    </View>
  );

  const renderItem: ListRenderItem<Alarm> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.time}>{item.time}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{habitLabel(item.habitType)}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{item.recurrence.type} · tap Simulate to test gate</Text>
      <Text style={styles.manageHint}>Edit time & reps, or remove this alarm.</Text>
      <View style={styles.cardActions}>
        <Pressable
          style={styles.editAction}
          accessibilityRole="button"
          accessibilityLabel={`Edit alarm ${item.time}`}
          onPress={() => router.push({ pathname: '/add-alarm', params: { id: item.id } })}>
          <Text style={styles.editActionLabel}>Edit alarm</Text>
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
          <Text style={styles.deleteActionLabel}>Delete</Text>
        </Pressable>
      </View>
      <Pressable style={styles.simulate} onPress={() => router.push(`/habit-gate/${item.id}`)}>
        <Text style={styles.simulateLabel}>Simulate alarm</Text>
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: dashboardTheme.bg,
  },
  screen: {
    flex: 1,
    backgroundColor: dashboardTheme.bg,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scrollEmpty: {
    flexGrow: 1,
  },
  headerBlock: {
    gap: 16,
    paddingBottom: 20,
  },
  footerBlock: {
    paddingTop: 24,
    gap: 10,
  },
  banner: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: dashboardTheme.surface,
    borderWidth: 1,
    borderColor: dashboardTheme.border,
    gap: 8,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: dashboardTheme.text,
  },
  bannerBody: {
    fontSize: 14,
    lineHeight: 20,
    color: dashboardTheme.textMuted,
  },
  bannerCta: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: dashboardTheme.primary,
  },
  bannerCtaLabel: {
    color: dashboardTheme.textOnPrimary,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '700',
    color: dashboardTheme.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  greetingPersonal: {
    fontSize: 22,
    fontWeight: '900',
    color: dashboardTheme.text,
    letterSpacing: -0.3,
  },
  greetingSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: dashboardTheme.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroRow: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: dashboardTheme.surface,
    borderWidth: 1,
    borderColor: dashboardTheme.border,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    color: dashboardTheme.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: dashboardTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  h1: {
    fontSize: 26,
    fontWeight: '900',
    color: dashboardTheme.text,
  },
  addChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: dashboardTheme.surface,
    borderWidth: 1,
    borderColor: dashboardTheme.primary,
  },
  addChipLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: dashboardTheme.primary,
  },
  lede: {
    fontSize: 14,
    lineHeight: 21,
    color: dashboardTheme.textMuted,
    marginTop: -4,
  },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: 8,
    gap: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: dashboardTheme.text,
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    color: dashboardTheme.textMuted,
    textAlign: 'center',
  },
  emptyCta: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: dashboardTheme.primary,
    borderWidth: 2,
    borderColor: dashboardTheme.border,
  },
  emptyCtaLabel: {
    fontWeight: '900',
    color: dashboardTheme.textOnPrimary,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: dashboardTheme.surface,
    borderWidth: 1,
    borderColor: dashboardTheme.border,
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
  time: {
    fontSize: 40,
    fontWeight: '900',
    color: dashboardTheme.text,
    letterSpacing: -1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 196, 48, 0.15)',
    borderWidth: 1,
    borderColor: dashboardTheme.primary,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: dashboardTheme.primary,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 13,
    color: dashboardTheme.textMuted,
    textTransform: 'capitalize',
  },
  manageHint: {
    fontSize: 12,
    fontWeight: '700',
    color: dashboardTheme.text,
    opacity: 0.9,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 10,
    marginTop: 10,
  },
  editAction: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 196, 48, 0.14)',
    borderWidth: 2,
    borderColor: dashboardTheme.primary,
  },
  editActionLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: dashboardTheme.primary,
  },
  deleteAction: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(230, 57, 70, 0.12)',
    borderWidth: 2,
    borderColor: dashboardTheme.alarmAccent,
  },
  deleteActionLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: dashboardTheme.alarmAccent,
  },
  simulate: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: dashboardTheme.primary,
    borderWidth: 2,
    borderColor: palette.groundedBrown,
  },
  simulateLabel: {
    fontWeight: '900',
    color: dashboardTheme.textOnPrimary,
    fontSize: 15,
  },
  reset: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: dashboardTheme.textMuted,
    textDecorationLine: 'underline',
    opacity: 0.85,
  },
});
