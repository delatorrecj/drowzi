import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

import type { HabitLogMethod, HabitType } from '@/src/shared/types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getHabitDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    try {
      if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('drowzi.db');
      return await dbPromise;
    } catch {
      console.warn('[habitSqlite] Web SQLite unavailable');
      return null;
    }
  }
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('drowzi.db');
  return dbPromise;
}

export async function ensureHabitSchema(): Promise<void> {
  const db = await getHabitDatabase();
  if (!db) return;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habit_config (
      alarm_id TEXT PRIMARY KEY NOT NULL,
      habit_type TEXT NOT NULL,
      rep_target INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alarm_id TEXT NOT NULL,
      habit_type TEXT NOT NULL,
      success INTEGER NOT NULL,
      method TEXT NOT NULL,
      local_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export async function upsertHabitConfig(input: {
  alarmId: string;
  habitType: HabitType;
  repTarget: number;
}): Promise<void> {
  const db = await getHabitDatabase();
  if (!db) return;
  await ensureHabitSchema();
  const updatedAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO habit_config (alarm_id, habit_type, rep_target, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(alarm_id) DO UPDATE SET
       habit_type = excluded.habit_type,
       rep_target = excluded.rep_target,
       updated_at = excluded.updated_at`,
    [input.alarmId, input.habitType, input.repTarget, updatedAt],
  );
}

export async function insertHabitLogRow(input: {
  alarmId: string;
  habitType: HabitType;
  success: boolean;
  method: HabitLogMethod;
  localDate: string;
}): Promise<void> {
  const db = await getHabitDatabase();
  if (!db) return;
  await ensureHabitSchema();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO habit_logs (alarm_id, habit_type, success, method, local_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.alarmId,
      input.habitType,
      input.success ? 1 : 0,
      input.method,
      input.localDate,
      createdAt,
    ],
  );
}
