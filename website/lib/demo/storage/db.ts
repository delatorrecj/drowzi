import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import { todayLocalDate } from "@/lib/demo/date";
import type { Alarm, HabitCompletionPayload } from "@/lib/demo/types";

export type StoredLog = HabitCompletionPayload & {
  id: string;
  completedAt: string;
};

export type RegisteredBarcode = {
  value: string;
  label?: string;
  createdAt: string;
};

interface DrowziDemoDB extends DBSchema {
  alarms: {
    key: string;
    value: Alarm;
  };
  habit_logs: {
    key: string;
    value: StoredLog;
    indexes: { "by-alarm": string; "by-date": string };
  };
  registered_barcodes: {
    key: string;
    value: RegisteredBarcode;
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = "drowzi-demo";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DrowziDemoDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<DrowziDemoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("alarms")) {
          db.createObjectStore("alarms", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("habit_logs")) {
          const logs = db.createObjectStore("habit_logs", {
            keyPath: "id",
          });
          logs.createIndex("by-alarm", "alarmId");
          logs.createIndex("by-date", "localDate");
        }
        if (!db.objectStoreNames.contains("registered_barcodes")) {
          db.createObjectStore("registered_barcodes", { keyPath: "value" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }
  return dbPromise;
}

export async function listAlarms(): Promise<Alarm[]> {
  const db = await getDb();
  return db.getAll("alarms");
}

export async function getAlarm(id: string): Promise<Alarm | undefined> {
  const db = await getDb();
  return db.get("alarms", id);
}

export async function saveAlarm(alarm: Alarm): Promise<void> {
  const db = await getDb();
  await db.put("alarms", alarm);
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("alarms", "readwrite");
  await Promise.all(alarms.map((a) => tx.store.put(a)));
  await tx.done;
}

export async function recordHabitCompletion(
  input: HabitCompletionPayload,
): Promise<StoredLog> {
  const entry: StoredLog = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    completedAt: new Date().toISOString(),
  };
  const db = await getDb();
  await db.put("habit_logs", entry);
  return entry;
}

export async function getRecentCompletions(limit = 20): Promise<StoredLog[]> {
  const db = await getDb();
  const all = await db.getAll("habit_logs");
  return all
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit);
}

function localDateMinusDays(isoDate: string, daysBack: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() - daysBack);
  return todayLocalDate(dt);
}

export async function getConsecutiveDayStreak(): Promise<number> {
  const db = await getDb();
  const logs = await db.getAll("habit_logs");
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

export async function listRegisteredBarcodes(): Promise<RegisteredBarcode[]> {
  const db = await getDb();
  return db.getAll("registered_barcodes");
}

export async function registerBarcode(value: string, label?: string): Promise<void> {
  const db = await getDb();
  await db.put("registered_barcodes", {
    value,
    label,
    createdAt: new Date().toISOString(),
  });
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get("settings", key) as Promise<T | undefined>;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.put("settings", value, key);
}

export async function ensureDemoSeed(): Promise<void> {
  const { DEMO_ALARMS, DEMO_BARCODE_VALUE } = await import("@/lib/demo/demoDefaults");
  const existing = await listAlarms();
  if (existing.length === 0) {
    await saveAlarms(DEMO_ALARMS);
  }
  const barcodes = await listRegisteredBarcodes();
  if (barcodes.length === 0) {
    await registerBarcode(DEMO_BARCODE_VALUE, "Demo item");
  }
}
