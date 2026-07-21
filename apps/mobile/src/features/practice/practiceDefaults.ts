import type { Alarm, HabitType } from '@/src/shared/types';
import type { Href } from 'expo-router';

export const PRACTICE_VOICE_PASSAGE =
  'I am awake. I am ready. Today I will complete my morning habit before the day begins.';

export const PRACTICE_BARCODE_VALUE = 'DROWZI-DEMO-001';

export const PRACTICE_REP_TARGET = 5;

/** Stable id for the one-shot practice alarm timer → habit-gate flow. */
export const PRACTICE_TEST_ALARM_ID = 'practice-test-motion';

export function createPracticeAlarm(
  habitType: Extract<HabitType, 'motion' | 'barcode' | 'voice'>,
  id?: string,
): Alarm {
  const now = new Date().toISOString();
  const base = {
    id: id ?? `practice-${habitType}`,
    userId: 'practice-user',
    time: '07:00',
    recurrence: { type: 'daily' as const },
    isActive: true,
    createdAt: now,
  };

  switch (habitType) {
    case 'motion':
      return {
        ...base,
        habitType: 'motion',
        habitConfig: {
          configVersion: 2,
          exerciseId: 'pushups',
          repTarget: PRACTICE_REP_TARGET,
        },
      };
    case 'barcode':
      return {
        ...base,
        habitType: 'barcode',
        habitConfig: { configVersion: 1, barcodeValue: PRACTICE_BARCODE_VALUE },
      };
    case 'voice':
      return {
        ...base,
        habitType: 'voice',
        habitConfig: { configVersion: 1, passageText: PRACTICE_VOICE_PASSAGE },
      };
  }
}

export const PRACTICE_ALARMS = {
  motion: createPracticeAlarm('motion'),
  barcode: createPracticeAlarm('barcode'),
  voice: createPracticeAlarm('voice'),
} as const;

export type PracticeGateLink = {
  href: Href;
  title: string;
  desc: string;
  meta: string;
};

/** Dashboard “Practice habit gates” rows — mirrors website DemoDashboard GATES. */
export const PRACTICE_GATE_LINKS: PracticeGateLink[] = [
  {
    href: '/practice/motion',
    title: 'Motion gate',
    desc: 'Camera counts push-up reps',
    meta: `${PRACTICE_REP_TARGET} reps`,
  },
  {
    href: '/practice/barcode',
    title: 'Barcode gate',
    desc: 'Scan a registered item',
    meta: 'Walk & scan',
  },
  {
    href: '/practice/voice',
    title: 'Voice gate',
    desc: 'Read your passage aloud',
    meta: 'Speech match',
  },
  {
    href: '/practice/alarm',
    title: 'Schedule alarm',
    desc: 'One-shot notification test',
    meta: 'On-device',
  },
];
