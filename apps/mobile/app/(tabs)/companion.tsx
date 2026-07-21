import { useCallback, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { AppText, MascotEvolution, color, mascotProgress } from '@/src/ui';
import { getConsecutiveDayStreak } from '@/src/platform/recordCompletion';

export default function CompanionScreen() {
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setStreak(await getConsecutiveDayStreak());
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

  const { stageName, next } = mascotProgress(streak);

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
        <AppText variant="h2">Your companion</AppText>
        <AppText variant="caption" color={color.textMuted}>
          Keep your streak alive and watch it evolve.
        </AppText>

        <MascotEvolution streak={streak} />

        <View style={styles.card}>
          {next ? (
            <>
              <AppText variant="label" color={color.textMuted}>
                Next milestone
              </AppText>
              <AppText variant="h3" color={color.primary}>
                {next.name} · Day {next.day}
              </AppText>
              <AppText variant="body" color={color.text}>
                {next.daysAway} more {next.daysAway === 1 ? 'day' : 'days'} to evolve from {stageName}.
              </AppText>
            </>
          ) : (
            <>
              <AppText variant="label" color={color.textMuted}>
                Max stage reached
              </AppText>
              <AppText variant="h3" color={color.primary}>
                {stageName} — legendary!
              </AppText>
              <AppText variant="body" color={color.text}>
                You’ve reached the final form. Keep the streak alive to hold it.
              </AppText>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  screen: { flex: 1, backgroundColor: color.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8, gap: 12 },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 8,
  },
});
