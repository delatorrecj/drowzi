const store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => (k in store ? store[k] : null)),
    setItem: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    removeItem: jest.fn(async (k: string) => {
      delete store[k];
    }),
  },
}));

import {
  recordHabitCompletion,
  getConsecutiveDayStreak,
  getDashboardStats,
} from '@/src/platform/recordCompletion';

type Day = string;
const log = (localDate: Day, success = true) =>
  recordHabitCompletion({
    alarmId: 'a1',
    habitType: 'motion',
    success,
    method: 'verified',
    localDate,
  });

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  jest.useFakeTimers();
  // Fixed "today" = 2026-07-21 (local).
  jest.setSystemTime(new Date(2026, 6, 21, 9, 0, 0));
});
afterEach(() => jest.useRealTimers());

describe('getConsecutiveDayStreak', () => {
  it('is 0 with no logs', async () => {
    expect(await getConsecutiveDayStreak()).toBe(0);
  });

  it('counts consecutive days ending today', async () => {
    await log('2026-07-19');
    await log('2026-07-20');
    await log('2026-07-21');
    expect(await getConsecutiveDayStreak()).toBe(3);
  });

  it('stops at a gap', async () => {
    await log('2026-07-21');
    await log('2026-07-20');
    await log('2026-07-17'); // gap on the 18th/19th
    expect(await getConsecutiveDayStreak()).toBe(2);
  });

  it('anchors on yesterday when today has no success', async () => {
    await log('2026-07-20');
    await log('2026-07-19');
    expect(await getConsecutiveDayStreak()).toBe(2);
  });

  it('ignores failed logs', async () => {
    await log('2026-07-21', false);
    expect(await getConsecutiveDayStreak()).toBe(0);
  });
});

describe('getDashboardStats', () => {
  it('reports zeros and a null rate with no logs', async () => {
    const s = await getDashboardStats();
    expect(s).toMatchObject({ streak: 0, totalCompleted: 0, successRate: null });
    expect(s.week).toHaveLength(7);
    expect(s.week.every((d) => !d.done)).toBe(true);
  });

  it('aggregates totals, success rate, and the week strip', async () => {
    await log('2026-07-21'); // today, success
    await log('2026-07-20'); // success
    await log('2026-07-20', false); // failure — counts against rate, not totals
    const s = await getDashboardStats();
    expect(s.totalCompleted).toBe(2);
    expect(s.successRate).toBe(67); // 2/3
    expect(s.streak).toBe(2);
    expect(s.week).toHaveLength(7);
    expect(s.week[6]).toMatchObject({ date: '2026-07-21', done: true }); // last = today
    expect(s.week[5]).toMatchObject({ date: '2026-07-20', done: true });
    expect(s.week[0]).toMatchObject({ date: '2026-07-15', done: false });
  });
});
