import { landmarkAt, type PoseLandmarks33 } from '@/src/features/exercise/landmarks';
import type { Validator } from '@/src/features/exercise/detectorTypes';

/** Mid-hip -> mid-shoulder vector. null when torso landmarks are missing. */
function torsoVector(landmarks: PoseLandmarks33): { dx: number; dy: number } | null {
  const ls = landmarkAt(landmarks, 'leftShoulder');
  const rs = landmarkAt(landmarks, 'rightShoulder');
  const lh = landmarkAt(landmarks, 'leftHip');
  const rh = landmarkAt(landmarks, 'rightHip');
  if (!ls || !rs || !lh || !rh) return null;
  const sx = (ls.x + rs.x) / 2;
  const sy = (ls.y + rs.y) / 2;
  const hx = (lh.x + rh.x) / 2;
  const hy = (lh.y + rh.y) / 2;
  return { dx: sx - hx, dy: sy - hy };
}

// ponytail: taller-than-wide / wider-than-tall is a generous 45° split; tighten
// per device if cheating slips through. Missing torso -> pass (confidence gate owns that).

/** Body upright — squats, jacks, warrior. Rejects lying-down cheats. */
export const torsoVertical: Validator = (landmarks) => {
  const v = torsoVector(landmarks);
  if (!v) return true;
  return Math.abs(v.dy) >= Math.abs(v.dx);
};

/** Body horizontal — real push-ups. Rejects standing arm-curls counted as reps. */
export const torsoHorizontal: Validator = (landmarks) => {
  const v = torsoVector(landmarks);
  if (!v) return true;
  return Math.abs(v.dx) >= Math.abs(v.dy);
};
