import { readFileSync } from 'fs';
import { join } from 'path';

import { parseAngleSeriesCsv } from '@/src/features/pushup/kaggleCsv';
import { createRepMachine } from '@/src/features/exercise/repStateMachine';

// Angle-based config shared by push-ups/squats: bent = active, extended = rest.
const angleConfig = (targetReps: number) => ({
  targetReps,
  isActive: (a: number) => a <= 90,
  isRest: (a: number) => a >= 160,
});

describe('createRepMachine', () => {
  it('counts one rep for extended -> bent -> extended (with debounce)', () => {
    const m = createRepMachine(angleConfig(5));
    // Feed each phase enough frames to clear the 2-frame debounce.
    for (const a of [175, 170, 80, 75, 170, 175]) m.feed(a);
    expect(m.snapshot().reps).toBe(1);
  });

  it('does not double-count a single noisy frame across the threshold', () => {
    const m = createRepMachine(angleConfig(5));
    // Sitting extended, one lone spurious "bent" frame, then extended again.
    for (const a of [175, 170, 175, 85, 175, 170]) m.feed(a);
    expect(m.snapshot().reps).toBe(0);
  });

  it('handles a boolean (0/1) openness signal for jumping jacks', () => {
    const m = createRepMachine({
      targetReps: 5,
      isActive: (v) => v >= 0.5,
      isRest: (v) => v < 0.5,
    });
    for (const v of [0, 0, 1, 1, 0, 0]) m.feed(v);
    expect(m.snapshot().reps).toBe(1);
  });

  it('ignores non-finite metrics', () => {
    const m = createRepMachine(angleConfig(5));
    for (const a of [175, NaN, 80, 75, NaN, 170, 175]) m.feed(a);
    expect(m.snapshot().reps).toBe(1);
  });

  it('ingests fixture CSV and reaches expected reps (regression)', () => {
    const csvPath = join(__dirname, '..', 'fixtures', 'pushup_sample.csv');
    const rows = parseAngleSeriesCsv(readFileSync(csvPath, 'utf8'));
    const m = createRepMachine(angleConfig(100));
    for (const row of rows) m.feed(row.angleDeg);
    expect(m.snapshot().reps).toBe(3);
  });
});
