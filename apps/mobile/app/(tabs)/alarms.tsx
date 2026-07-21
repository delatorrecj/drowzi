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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useFocusEffect } from 'expo-router';

import type { Alarm } from '@/src/shared/types';
import { AppText, Badge, EmptyState, color } from '@/src/ui';
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

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [nextRingById, setNextRingById] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

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
});
