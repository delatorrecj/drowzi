import { createConfigDetector } from '@/src/features/exercise/configDetector';
import type { ExerciseSpec } from '@/src/features/exercise/detectorTypes';
import { BLAZEPOSE, type PoseLandmarks33 } from '@/src/features/exercise/landmarks';

function fullBody(): PoseLandmarks33 {
  return Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 }));
}

// Left arm posed to a target elbow angle: 180 (extended) vs 90 (bent).
function armFrame(bent: boolean): PoseLandmarks33 {
  const lm = fullBody();
  lm[BLAZEPOSE.leftShoulder] = { x: 0.5, y: 0.3, visibility: 0.9 };
  lm[BLAZEPOSE.leftElbow] = { x: 0.5, y: 0.5, visibility: 0.9 };
  lm[BLAZEPOSE.leftWrist] = bent
    ? { x: 0.7, y: 0.5, visibility: 0.9 } // ~90
    : { x: 0.5, y: 0.7, visibility: 0.9 }; // ~180
  return lm;
}

const ARM_REQUIRED = ['leftShoulder', 'leftElbow', 'leftWrist'] as const;

describe('createConfigDetector (reps, chain spec)', () => {
  it('counts reps from an arm-angle spec', () => {
    const spec: ExerciseSpec = { kind: 'reps', chain: 'arm', activeBelowDeg: 90, restAboveDeg: 160 };
    const det = createConfigDetector(spec, 2, [...ARM_REQUIRED], 0.6);
    // two frames per phase to clear debounce, one full down-up = 1 rep
    for (const bent of [false, false, true, true, false, false]) det.feed(armFrame(bent));
    expect(det.snapshot()).toMatchObject({ mode: 'reps', reps: 1, target: 2 });
  });

  it('reports repProgress 0 at rest and 1 at full active depth', () => {
    const spec: ExerciseSpec = { kind: 'reps', chain: 'arm', activeBelowDeg: 90, restAboveDeg: 160 };
    const det = createConfigDetector(spec, 2, [...ARM_REQUIRED], 0.6);
    det.feed(armFrame(false)); // ~180 -> above rest, clamps to 0
    expect(det.debug!().repProgress).toBe(0);
    det.feed(armFrame(true)); // ~90 -> at active threshold, ~1
    expect(det.debug!().repProgress).toBeCloseTo(1, 1);
  });
});

describe('createConfigDetector (reps, metric spec)', () => {
  it('counts reps from a custom scalar metric', () => {
    // metric = nose.x; active when high, rest when low.
    const spec: ExerciseSpec = {
      kind: 'reps',
      metric: (lm) => lm[BLAZEPOSE.nose].x,
      activeAbove: 0.8,
      restBelow: 0.2,
    };
    const det = createConfigDetector(spec, 5, ['nose'], 0.6);
    const frame = (x: number) => {
      const lm = fullBody();
      lm[BLAZEPOSE.nose] = { x, y: 0.5, visibility: 0.9 };
      return lm;
    };
    for (const x of [0.1, 0.1, 0.9, 0.9, 0.1, 0.1]) det.feed(frame(x));
    expect(det.snapshot()).toMatchObject({ reps: 1 });
  });
});

describe('createConfigDetector validators', () => {
  it('rejects frames that fail a validator (no reps counted)', () => {
    const spec: ExerciseSpec = {
      kind: 'reps',
      chain: 'arm',
      activeBelowDeg: 90,
      restAboveDeg: 160,
      validators: [() => false], // always reject
    };
    const det = createConfigDetector(spec, 2, [...ARM_REQUIRED], 0.6);
    for (const bent of [false, false, true, true, false, false]) det.feed(armFrame(bent));
    expect(det.snapshot()).toMatchObject({ reps: 0 });
    expect(det.isTrackingLost()).toBe(true);
  });
});
