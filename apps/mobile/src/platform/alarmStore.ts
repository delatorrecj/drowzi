import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Alarm } from '@/src/shared/types';

import { cancelAlarm, scheduleAlarm } from '@/src/platform/alarmScheduler';
import { storageKeys } from '@/src/platform/storage';

const DEMO_ALARM: Alarm = {
  id: 'demo-alarm',
  userId: 'local-dev',
  time: '06:30',
  recurrence: { type: 'daily' },
  habitType: 'motion',
  habitConfig: { configVersion: 1, repTarget: 10 },
  isActive: true,
  createdAt: new Date().toISOString(),
};

async function readRaw(): Promise<Alarm[]> {
  const raw = await AsyncStorage.getItem(storageKeys.alarms);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Alarm[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRaw(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(storageKeys.alarms, JSON.stringify(alarms));
}

export async function getAlarms(): Promise<Alarm[]> {
  const alarms = await readRaw();
  if (alarms.length === 0) {
    await writeRaw([DEMO_ALARM]);
    await scheduleAlarm(DEMO_ALARM);
    return [DEMO_ALARM];
  }
  return alarms;
}

export async function getAlarmById(id: string): Promise<Alarm | null> {
  const alarms = await getAlarms();
  return alarms.find((a) => a.id === id) ?? null;
}

export async function saveAlarm(alarm: Alarm): Promise<void> {
  const alarms = await readRaw();
  const idx = alarms.findIndex((a) => a.id === alarm.id);
  if (idx >= 0) alarms[idx] = alarm;
  else alarms.push(alarm);
  await writeRaw(alarms);
  await cancelAlarm(alarm.id);
  if (alarm.isActive) await scheduleAlarm(alarm);
}
