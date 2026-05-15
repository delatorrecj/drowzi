import { leftArmFromMovenetKeypoints, parseMovenetOutputToLeftArm } from '@/src/features/pushup/movenetKeypoints';
import { MOVENET_KEYPOINT } from '@/src/features/pushup/movenetTypes';

describe('parseMovenetOutputToLeftArm', () => {
  it('parses 51-float buffer into left arm when confident', () => {
    const f = new Float32Array(51);
    for (let i = 0; i < 17; i++) {
      f[i * 3] = 0.1 * i;
      f[i * 3 + 1] = 0.2 * i;
      f[i * 3 + 2] = 0.9;
    }
    const arm = parseMovenetOutputToLeftArm(f.buffer);
    expect(arm).not.toBeNull();
    expect(arm!.leftShoulder.x).toBeCloseTo(f[MOVENET_KEYPOINT.leftShoulder * 3 + 1]);
  });

  it('returns null when arm joints have low confidence', () => {
    const f = new Float32Array(51);
    f.fill(0.5);
    for (let i = 0; i < 17; i++) f[i * 3 + 2] = 0.1;
    const arm = parseMovenetOutputToLeftArm(f.buffer);
    expect(arm).toBeNull();
  });
});

describe('leftArmFromMovenetKeypoints', () => {
  it('maps structured keypoints', () => {
    const pts = Array.from({ length: 17 }, (_, i) => ({
      y: i * 0.05,
      x: i * 0.06,
      confidence: 1,
    }));
    const arm = leftArmFromMovenetKeypoints(pts);
    expect(arm?.leftElbow.y).toBeCloseTo(pts[MOVENET_KEYPOINT.leftElbow].y);
  });
});
