import { migrateHabitConfig } from '@/src/platform/migrateHabitConfig';

describe('migrateHabitConfig', () => {
  it('migrates v1 motion config to pushups v2', () => {
    const out = migrateHabitConfig('motion', { configVersion: 1, repTarget: 15 });
    expect(out).toEqual({ configVersion: 2, exerciseId: 'pushups', repTarget: 15 });
  });

  it('preserves v2 motion config', () => {
    const out = migrateHabitConfig('motion', {
      configVersion: 2,
      exerciseId: 'squats',
      repTarget: 20,
    });
    expect(out).toEqual({ configVersion: 2, exerciseId: 'squats', repTarget: 20 });
  });

  it('defaults pose config to warrior_i', () => {
    const out = migrateHabitConfig('pose', { configVersion: 1, note: 'x' });
    expect(out).toEqual({ configVersion: 2, exerciseId: 'warrior_i', holdDurationSeconds: 30 });
  });
});
