import AsyncStorage from '@react-native-async-storage/async-storage';

import type { HabitCompletionPayload } from '@/src/shared/types';

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

/** Persist locally first; Supabase sync hooks go here later (Dev A). */
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
