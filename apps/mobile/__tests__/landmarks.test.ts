import {
  landmarksMeetConfidence,
  MOTION_CONFIDENCE_MIN,
  HOLD_CONFIDENCE_MIN,
  type PoseLandmarks33,
} from '@/src/features/exercise/landmarks';

function mockLandmarks(score: number): PoseLandmarks33 {
  return Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: score }));
}

describe('landmarksMeetConfidence', () => {
  it('passes at motion threshold 0.6', () => {
    const lm = mockLandmarks(0.61);
    expect(
      landmarksMeetConfidence(lm, ['leftShoulder', 'leftElbow', 'leftWrist'], MOTION_CONFIDENCE_MIN),
    ).toBe(true);
  });

  it('fails below motion threshold', () => {
    const lm = mockLandmarks(0.59);
    expect(
      landmarksMeetConfidence(lm, ['leftShoulder', 'leftElbow', 'leftWrist'], MOTION_CONFIDENCE_MIN),
    ).toBe(false);
  });

  it('uses hold threshold 0.65', () => {
    const lm = mockLandmarks(0.64);
    expect(
      landmarksMeetConfidence(lm, ['leftShoulder', 'rightShoulder'], HOLD_CONFIDENCE_MIN),
    ).toBe(false);
    lm[11]!.visibility = 0.66;
    lm[12]!.visibility = 0.66;
    expect(
      landmarksMeetConfidence(lm, ['leftShoulder', 'rightShoulder'], HOLD_CONFIDENCE_MIN),
    ).toBe(true);
  });
});
