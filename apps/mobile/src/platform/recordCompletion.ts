import AsyncStorage from '@react-native-async-storage/async-storage';

import type { HabitCompletionPayload } from '@/src/shared/types';
import { todayLocalDate } from '@/src/shared/date';

import { storageKeys } from '@/src/platform/storage';

type StoredLog = HabitCompletionPayload & { id: string; completedAt: string };

async function readLogs(): Promise<StoredLog[]> {
  const raw = await AsyncStorage.getItem(storageKeys.habitLogs);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLogs(logs: StoredLog[]): Promise<void> {
  await AsyncStorage.setItem(storageKeys.habitLogs, JSON.stringify(logs));
}

export type RecordCompletionInput = HabitCompletionPayload;

/** Persist locally (AsyncStorage — native + web). */
export async function recordHabitCompletion(input: RecordCompletionInput): Promise<StoredLog> {
  const entry: StoredLog = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    completedAt: new Date().toISOString(),
  };
  const logs = await readLogs();
  logs.unshift(entry);
  await writeLogs(logs);
  return entry;
}

export async function getRecentCompletions(limit = 20): Promise<StoredLog[]> {
  const logs = await readLogs();
  return logs.slice(0, limit);
}

function localDateMinusDays(isoDate: string, daysBack: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() - daysBack);
  return todayLocalDate(dt);
}

/** Consecutive calendar days with ≥1 successful habit log, counting back from today or yesterday. */
export async function getConsecutiveDayStreak(): Promise<number> {
  const logs = await readLogs();
  const successDates = new Set(logs.filter((l) => l.success).map((l) => l.localDate));
  let anchor = todayLocalDate();
  if (!successDates.has(anchor)) {
    anchor = localDateMinusDays(anchor, 1);
  }
  let streak = 0;
  let cursor = anchor;
  while (successDates.has(cursor)) {
    streak++;
    cursor = localDateMinusDays(cursor, 1);
  }
  return streak;
}
