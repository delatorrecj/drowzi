import type { HabitConfig, HabitType } from '@/src/shared/types';

export type AlarmSetupCategoryId = 'physical' | 'environmental' | 'cognitive';

/** Full catalog — environmental & cognitive muted in UI for V1 (motion-only). */
export const ALARM_SETUP_CATEGORIES_ALL: {
  id: AlarmSetupCategoryId;
  title: string;
  subtitle: string;
  habitType: HabitType;
}[] = [
  {
    id: 'physical',
    title: 'Physical',
    subtitle: 'Push-ups, squats, stretches — motion proves you’re awake.',
    habitType: 'motion',
  },
  {
    id: 'environmental',
    title: 'Environmental',
    subtitle: 'Scan something in another room so you actually get up.',
    habitType: 'barcode',
  },
  {
    id: 'cognitive',
    title: 'Cognitive / mindfulness',
    subtitle: 'Read a short passage aloud and start with intention.',
    habitType: 'voice',
  },
];

/** Shown in onboarding / add-alarm. Remove `.filter` to re-enable other gates. */
export const ALARM_SETUP_CATEGORIES = ALARM_SETUP_CATEGORIES_ALL.filter((c) => c.id === 'physical');

export const PHYSICAL_SETUP_CATEGORY = ALARM_SETUP_CATEGORIES_ALL[0];

export function normalizeAlarmTime(raw: string): string | null {
  const s = raw.trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function buildHabitConfigFromInputs(
  habitType: HabitType,
  repInput: string,
  barcodeInput: string,
  passageInput: string,
): HabitConfig {
  if (habitType === 'motion') {
    const n = Math.min(500, Math.max(1, parseInt(repInput, 10) || 10));
    return { configVersion: 1, repTarget: n };
  }
  if (habitType === 'barcode') {
    const v = barcodeInput.trim() || 'pending-register-item';
    return { configVersion: 1, barcodeValue: v };
  }
  if (habitType === 'voice') {
    return { configVersion: 1, passageText: passageInput.trim() || 'Today I wake up on purpose.' };
  }
  return { configVersion: 1, note: 'alarm-setup' };
}
