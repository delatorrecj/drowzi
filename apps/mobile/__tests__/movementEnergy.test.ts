import { movementEnergy, BLAZEPOSE, type PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import { EXERCISE_REGISTRY } from '@/src/features/exercise/exerciseRegistry';

function body(offset = 0): PoseLandmarks33 {
  const lm: PoseLandmarks33 = Array.from({ length: 33 }, () => ({
    x: 0.5 + offset,
    y: 0.5,
    visibility: 0.9,
  }));
  // Give it a real torso so the normalization scale is non-degenerate.
  lm[BLAZEPOSE.leftShoulder] = { x: 0.45 + offset, y: 0.3, visibility: 0.9 };
  lm[BLAZEPOSE.rightShoulder] = { x: 0.55 + offset, y: 0.3, visibility: 0.9 };
  lm[BLAZEPOSE.leftHip] = { x: 0.45 + offset, y: 0.6, visibility: 0.9 };
  lm[BLAZEPOSE.rightHip] = { x: 0.55 + offset, y: 0.6, visibility: 0.9 };
  return lm;
}

describe('movementEnergy', () => {
  it('is ~0 for identical frames', () => {
    const f = body();
    expect(movementEnergy(f, f)).toBeCloseTo(0, 6);
  });

  it('is 0 with no previous frame', () => {
    expect(movementEnergy(body(), null)).toBe(0);
  });

  it('is high when the body shifts a lot', () => {
    expect(movementEnergy(body(0.3), body(0))).toBeGreaterThan(0.15);
  });
});

describe('generic_motion detector', () => {
  it('counts a rep on a big-move / settle cycle', () => {
    const det = EXERCISE_REGISTRY.generic_motion.createDetector(3);
    // still, then sustained movement (several frames), then settle -> 1 rep
    const seq = [body(0), body(0), body(0.15), body(0.3), body(0.45), body(0.45), body(0.45)];
    for (const f of seq) det.feed(f);
    expect(det.snapshot()).toMatchObject({ mode: 'reps', reps: 1 });
  });
});
