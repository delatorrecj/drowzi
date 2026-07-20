import { EXERCISE_REGISTRY } from '@/src/features/exercise/exerciseRegistry';
import { BLAZEPOSE, type PoseLandmarks33 } from '@/src/features/exercise/landmarks';

function warriorLandmarks(): PoseLandmarks33 {
  const lm: PoseLandmarks33 = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.9,
  }));
  lm[BLAZEPOSE.leftShoulder] = { x: 0.4, y: 0.3, visibility: 0.9 };
  lm[BLAZEPOSE.rightShoulder] = { x: 0.6, y: 0.3, visibility: 0.9 };
  lm[BLAZEPOSE.leftWrist] = { x: 0.35, y: 0.15, visibility: 0.9 };
  lm[BLAZEPOSE.rightWrist] = { x: 0.65, y: 0.15, visibility: 0.9 };
  lm[BLAZEPOSE.leftHip] = { x: 0.42, y: 0.55, visibility: 0.9 };
  lm[BLAZEPOSE.rightHip] = { x: 0.58, y: 0.55, visibility: 0.9 };
  lm[BLAZEPOSE.leftKnee] = { x: 0.4, y: 0.72, visibility: 0.9 };
  lm[BLAZEPOSE.leftAnkle] = { x: 0.38, y: 0.9, visibility: 0.9 };
  lm[BLAZEPOSE.rightKnee] = { x: 0.62, y: 0.75, visibility: 0.9 };
  lm[BLAZEPOSE.rightAnkle] = { x: 0.64, y: 0.92, visibility: 0.9 };
  return lm;
}

describe('warrior_i hold detector (via registry spec)', () => {
  it('completes via simulateOneStep', () => {
    const det = EXERCISE_REGISTRY.warrior_i.createDetector(30);
    det.simulateOneStep();
    const snap = det.snapshot();
    expect(snap.mode).toBe('hold');
    if (snap.mode === 'hold') {
      expect(snap.heldSeconds).toBeGreaterThanOrEqual(30);
    }
    expect(det.feed(warriorLandmarks())).toBe(true);
  });
});
