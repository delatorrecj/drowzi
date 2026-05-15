import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Alarm } from '@/src/shared/types';

import { cancelAlarm, scheduleAlarm, type ScheduleAlarmResult } from '@/src/platform/alarmScheduler';
import { storageKeys } from '@/src/platform/storage';

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

/** No implicit demo alarm — first alarm comes from onboarding (PRD US-05). */
export async function getAlarms(): Promise<Alarm[]> {
  return readRaw();
}

export async function getAlarmById(id: string): Promise<Alarm | null> {
  const alarms = await getAlarms();
  return alarms.find((a) => a.id === id) ?? null;
}

export async function saveAlarm(alarm: Alarm): Promise<{ scheduling: ScheduleAlarmResult }> {
  const alarms = await readRaw();
  const idx = alarms.findIndex((a) => a.id === alarm.id);
  if (idx >= 0) alarms[idx] = alarm;
  else alarms.push(alarm);
  await writeRaw(alarms);
  await cancelAlarm(alarm.id);
  if (alarm.isActive) {
    const scheduling = await scheduleAlarm(alarm);
    return { scheduling };
  }
  return { scheduling: { ok: true } };
}

export async function deleteAlarm(id: string): Promise<void> {
  const alarms = await readRaw();
  await writeRaw(alarms.filter((a) => a.id !== id));
  await cancelAlarm(id);
}
