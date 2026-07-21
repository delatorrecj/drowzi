import { useCallback, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { AppText, EmptyState, StatCard, color } from '@/src/ui';
import { getInsightsStats, type InsightsStats } from '@/src/platform/recordCompletion';
import type { HabitLogMethod } from '@/src/shared/types';

const EMPTY: InsightsStats = {
  streak: 0,
  totalCompleted: 0,
  successRate: null,
  totalLogs: 0,
  calendar: [],
  byMethod: { verified: 0, fallback_timer: 0, force_closed: 0 },
};

const METHOD_LABELS: Record<HabitLogMethod, string> = {
  verified: 'Verified by sensor',
  fallback_timer: 'Fallback timer',
  force_closed: 'Force-closed',
};

export default function InsightsScreen() {
  const [stats, setStats] = useState<InsightsStats>(EMPTY);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setStats(await getInsightsStats(30));
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

  const isEmpty = stats.totalLogs === 0;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.scroll, isEmpty && styles.scrollEmpty]}
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
        {isEmpty ? (
          <EmptyState
            icon="alarm-bell"
            title="No history yet"
            body="Complete a habit gate — via Simulate or the practice drills — and your progress shows up here."
          />
        ) : (
          <>
            <AppText variant="h2">Insights</AppText>

            <View style={styles.statsRow}>
              <StatCard value={stats.streak} label="Streak" />
              <StatCard value={stats.totalCompleted} label="Completed" />
              <StatCard
                value={stats.successRate === null ? '—' : `${stats.successRate}%`}
                label="Success"
              />
            </View>

            <View style={styles.card}>
              <AppText variant="label" color={color.textMuted}>
                Last 30 days
              </AppText>
              <View style={styles.heatmap}>
                {stats.calendar.map((day) => (
                  <View
                    key={day.date}
                    style={[styles.heatCell, day.done && styles.heatCellDone]}
                  />
                ))}
              </View>
              <AppText variant="caption" color={color.textMuted}>
                Each square is a day; filled = habit completed.
              </AppText>
            </View>

            <View style={styles.card}>
              <AppText variant="label" color={color.textMuted}>
                How you completed them
              </AppText>
              {(Object.keys(METHOD_LABELS) as HabitLogMethod[]).map((m) => (
                <View key={m} style={styles.methodRow}>
                  <AppText variant="body">{METHOD_LABELS[m]}</AppText>
                  <AppText variant="bodyStrong" color={color.primary}>
                    {stats.byMethod[m]}
                  </AppText>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  screen: { flex: 1, backgroundColor: color.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8, gap: 16 },
  scrollEmpty: { flexGrow: 1 },
  statsRow: { flexDirection: 'row', gap: 12 },
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 12,
  },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heatCell: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.border,
  },
  heatCellDone: { backgroundColor: color.primary, borderColor: color.primary },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
