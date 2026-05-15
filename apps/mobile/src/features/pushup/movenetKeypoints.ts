import type { LeftArmChain, PosePoint } from '@/src/features/pushup/poseTypes';
import { MOVENET_KEYPOINT, type MovenetPt } from '@/src/features/pushup/movenetTypes';

const LOW_CONFIDENCE = 0.25;

export function parseMovenetOutputToKeypoints(firstOutput: ArrayBuffer): MovenetPt[] {
  const f = new Float32Array(firstOutput);
  if (f.length < 51) {
    throw new Error(`Unexpected MoveNet output length: ${f.length}`);
  }
  const pts: MovenetPt[] = [];
  for (let i = 0; i < 17; i++) {
    pts.push({
      y: f[i * 3],
      x: f[i * 3 + 1],
      confidence: f[i * 3 + 2],
    });
  }
  return pts;
}

function toPosePoint(p: MovenetPt): PosePoint {
  return { x: p.x, y: p.y, z: 0, visibility: p.confidence };
}

export function leftArmFromMovenetKeypoints(pts: MovenetPt[]): LeftArmChain | null {
  const ls = pts[MOVENET_KEYPOINT.leftShoulder];
  const le = pts[MOVENET_KEYPOINT.leftElbow];
  const lw = pts[MOVENET_KEYPOINT.leftWrist];
  if (!ls || !le || !lw) return null;
  if (ls.confidence < LOW_CONFIDENCE || le.confidence < LOW_CONFIDENCE || lw.confidence < LOW_CONFIDENCE) {
    return null;
  }
  return {
    leftShoulder: toPosePoint(ls),
    leftElbow: toPosePoint(le),
    leftWrist: toPosePoint(lw),
  };
}

export function parseMovenetOutputToLeftArm(firstOutput: ArrayBuffer): LeftArmChain | null {
  try {
    const pts = parseMovenetOutputToKeypoints(firstOutput);
    return leftArmFromMovenetKeypoints(pts);
  } catch {
    return null;
  }
}
