import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useFocusEffect } from 'expo-router';

import { AppText, MascotEvolution, StatCard, color } from '@/src/ui';
import { isNotificationPermissionGranted } from '@/src/platform/alarmScheduler';
import { getDashboardStats, type DashboardStats } from '@/src/platform/recordCompletion';
import {
  getDisplayName,
  isOnboardingComplete,
  markSetupReminderShown,
  wasAlarmSetupSkipped,
  wasSetupReminderShown,
} from '@/src/platform/onboarding';
import { mascotAssets } from '@/assets/images/mascot';

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
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [onboarded, setOnboarded] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [notificationAllowed, setNotificationAllowed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const [dashStats, done, name, notifGranted] = await Promise.all([
      getDashboardStats(),
      isOnboardingComplete(),
      getDisplayName(),
      Platform.OS === 'web' ? Promise.resolve(true) : isNotificationPermissionGranted(),
    ]);
    setStats(dashStats);
    setOnboarded(done);
    setDisplayName(name);
    setNotificationAllowed(notifGranted);
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

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scroll}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={color.primary}
              colors={[color.primary]}
            />
          )
        }>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  screen: { flex: 1, backgroundColor: color.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8, gap: 16 },
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
});
