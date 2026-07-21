import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useFocusEffect } from 'expo-router';

import type { Alarm } from '@/src/shared/types';
import { AppText, Badge, Button, EmptyState, Icon, color, radius, shadow, type IconName } from '@/src/ui';
import { deleteAlarm, getAlarms } from '@/src/platform/alarmStore';
import { formatNextAlarmRingSummary } from '@/src/platform/alarmScheduler';
import { PRACTICE_TEST_ALARM_ID } from '@/src/features/practice/practiceDefaults';

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

function habitIcon(type: Alarm['habitType']): IconName {
  switch (type) {
    case 'motion':
      return 'motion';
    case 'barcode':
      return 'barcode';
    case 'voice':
      return 'voice';
    case 'pose':
      return 'figure';
    case 'meditation':
      return 'snooze';
    default:
      return 'alarm-bell';
  }
}

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [nextRingById, setNextRingById] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const reduced = useReducedMotion();

  const refresh = useCallback(async () => {
    const list = await getAlarms();
    setAlarms(list.filter((a) => a.id !== PRACTICE_TEST_ALARM_ID && !a.id.startsWith('practice-')));

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

  const header = (
    <View style={styles.headerBlock}>
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

  const empty = (
    <EmptyState
      icon="alarm-bell"
      title="No alarms yet"
      body="Run onboarding or add your first habit alarm to wake up accountable."
      cta={{ label: 'Set up first alarm', onPress: () => router.push('/add-alarm') }}
    />
  );

  const renderItem: ListRenderItem<Alarm> = ({ item, index }) => {
    const card = (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <AppText variant="h1" style={styles.time}>
            {item.time}
          </AppText>
          <View style={styles.habitTag}>
            <Icon name={habitIcon(item.habitType)} size={18} stroke={color.primary} />
            <Badge label={habitLabel(item.habitType)} />
          </View>
        </View>
        <View style={styles.nextRingRow}>
          <Icon name="alarm-bell" size={14} stroke={color.primary} />
          <AppText variant="bodyStrong" color={color.primary} style={styles.nextRing}>
            {nextRingById[item.id] ?? '—'}
          </AppText>
        </View>
        <AppText variant="caption" color={color.textMuted} style={{ textTransform: 'capitalize' }}>
          {item.recurrence.type} · tap Simulate to practise the gate now
        </AppText>
        <View style={styles.cardActions}>
          <Button
            title="Edit"
            variant="secondary"
            style={styles.action}
            accessibilityLabel={`Edit alarm ${item.time}`}
            onPress={() => router.push({ pathname: '/add-alarm', params: { id: item.id } })}
          />
          <Button
            title="Delete"
            variant="danger"
            style={styles.action}
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
            }
          />
        </View>
        <Button
          title="Simulate alarm"
          variant="primary"
          onPress={() => router.push(`/habit-gate/${item.id}`)}
        />
      </View>
    );

    if (reduced) return card;
    return <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>{card}</Animated.View>;
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[styles.scroll, alarms.length === 0 && styles.scrollEmpty]}
        data={alarms}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },
  scrollEmpty: { flexGrow: 1 },
  headerBlock: { gap: 8, paddingBottom: 16 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.primary,
  },
  card: {
    padding: 18,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 8,
    ...shadow.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  time: { fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  habitTag: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextRingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  nextRing: { fontSize: 13 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  action: { flex: 1 },
});
