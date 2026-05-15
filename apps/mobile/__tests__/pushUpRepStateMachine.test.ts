import { readFileSync } from 'fs';
import { join } from 'path';

import { parseAngleSeriesCsv } from '@/src/features/pushup/kaggleCsv';
import { calculateAngle } from '@/src/features/pushup/geometry';
import { createPushUpRepMachine } from '@/src/features/pushup/pushUpRepStateMachine';

describe('calculateAngle', () => {
  it('returns 180 for a straight line', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 2, y: 0 };
    expect(calculateAngle(a, b, c)).toBeCloseTo(180, 5);
  });

  it('returns ~90 for a right angle', () => {
    const shoulder = { x: 0, y: 0 };
    const elbow = { x: 0, y: 1 };
    const wrist = { x: 1, y: 1 };
    expect(calculateAngle(shoulder, elbow, wrist)).toBeCloseTo(90, 5);
  });
});

describe('createPushUpRepMachine', () => {
  it('counts a rep from left-arm landmark frames', () => {
    const m = createPushUpRepMachine({
      targetReps: 3,
      extendedMinDeg: 160,
      bentMaxDeg: 90,
    });
    const extended = {
      leftShoulder: { x: 0, y: 0 },
      leftElbow: { x: 1, y: 0 },
      leftWrist: { x: 2, y: 0 },
    };
    const bent = {
      leftShoulder: { x: 0, y: 0 },
      leftElbow: { x: 0, y: 1 },
      leftWrist: { x: 1, y: 1 },
    };
    m.feedLandmarks(extended);
    m.feedLandmarks(bent);
    m.feedLandmarks(extended);
    expect(m.snapshot().reps).toBe(1);
  });

  it('counts one rep for top to bottom to top', () => {
    const m = createPushUpRepMachine({
      targetReps: 5,
      extendedMinDeg: 160,
      bentMaxDeg: 90,
    });
    expect(m.snapshot().reps).toBe(0);
    m.feedElbowAngleDeg(170);
    m.feedElbowAngleDeg(80);
    m.feedElbowAngleDeg(165);
    expect(m.snapshot().reps).toBe(1);
  });

  it('ingests fixture CSV and reaches expected reps', () => {
    const csvPath = join(__dirname, '..', 'fixtures', 'pushup_sample.csv');
    const csv = readFileSync(csvPath, 'utf8');
    const rows = parseAngleSeriesCsv(csv);
    const m = createPushUpRepMachine({
      targetReps: 100,
      extendedMinDeg: 160,
      bentMaxDeg: 90,
    });

    for (const row of rows) {
      m.feedElbowAngleDeg(row.angleDeg);
    }
    expect(m.snapshot().reps).toBe(3);
  });
});
