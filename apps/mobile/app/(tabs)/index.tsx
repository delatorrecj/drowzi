import { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';

import type { Alarm } from '@/src/shared/types';
import { fonts, palette } from '@/src/shared/theme';
import { getAlarms } from '@/src/platform/alarmStore';
import { getRecentCompletions } from '@/src/platform/recordCompletion';
import { isOnboardingComplete, setOnboardingComplete } from '@/src/platform/onboarding';

export default function HomeScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [recentCount, setRecentCount] = useState(0);
  const [onboarded, setOnboarded] = useState(true);

  const refresh = useCallback(async () => {
    const [list, recent, done] = await Promise.all([
      getAlarms(),
      getRecentCompletions(5),
      isOnboardingComplete(),
    ]);
    setAlarms(list);
    setRecentCount(recent.length);
    setOnboarded(done);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const header = (
    <View style={styles.headerBlock}>
      {!onboarded ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Finish onboarding</Text>
          <Link href="/onboarding" asChild>
            <Pressable style={styles.bannerCta}>
              <Text style={styles.bannerCtaLabel}>Open welcome flow</Text>
            </Pressable>
          </Link>
        </View>
      ) : null}

      <Text style={styles.h1}>Your alarms</Text>
      <Text style={styles.lede}>Simulate an alarm to walk the habit gate path end-to-end.</Text>
    </View>
  );

  const footer = (
    <View style={styles.footerBlock}>
      <Text style={styles.stat}>Recent logs (sample): {recentCount}</Text>
      <Pressable
        style={styles.reset}
        onPress={async () => {
          await setOnboardingComplete(false);
          void refresh();
        }}>
        <Text style={styles.resetLabel}>Reset onboarding flag (dev)</Text>
      </Pressable>
    </View>
  );

  const renderItem: ListRenderItem<Alarm> = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.time}>{item.time}</Text>
      <Text style={styles.meta}>
        {item.habitType} · {item.recurrence.type}
      </Text>
      <Pressable style={styles.simulate} onPress={() => router.push(`/habit-gate/${item.id}`)}>
        <Text style={styles.simulateLabel}>Simulate alarm</Text>
      </Pressable>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.scroll}
      data={alarms}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surfaceLight,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    gap: 14,
    paddingBottom: 14,
  },
  footerBlock: {
    paddingTop: 20,
    gap: 10,
  },
  banner: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(101, 67, 33, 0.2)',
    gap: 8,
  },
  bannerTitle: {
    fontSize: 16,
    fontFamily: fonts.headlineExtraBold,
    color: palette.groundedBrown,
  },
  bannerCta: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: palette.adrenalineRed,
  },
  bannerCtaLabel: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
  },
  h1: {
    fontSize: 28,
    fontFamily: fonts.headlineBlack,
    color: palette.groundedBrown,
  },
  lede: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
    color: palette.groundedBrown,
    opacity: 0.85,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(101, 67, 33, 0.15)',
    gap: 6,
  },
  time: {
    fontSize: 32,
    fontFamily: fonts.headlineBlack,
    color: palette.groundedBrown,
  },
  meta: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: palette.groundedBrown,
    opacity: 0.85,
    textTransform: 'capitalize',
  },
  simulate: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: palette.awakeningYellow,
  },
  simulateLabel: {
    fontFamily: fonts.bodyBold,
    color: palette.groundedBrown,
  },
  stat: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: palette.groundedBrown,
  },
  reset: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetLabel: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: palette.groundedBrown,
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
});
