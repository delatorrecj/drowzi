import type { PosePoint } from '@/src/features/pushup/poseTypes';

export function calculateAngle(a: PosePoint, b: PosePoint, c: PosePoint): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const abz = (a.z ?? 0) - (b.z ?? 0);
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const cbz = (c.z ?? 0) - (b.z ?? 0);

  const dot = abx * cbx + aby * cby + abz * cbz;
  const magAb = Math.hypot(abx, aby, abz);
  const magCb = Math.hypot(cbx, cby, cbz);
  if (magAb === 0 || magCb === 0) return NaN;

  const cos = Math.max(-1, Math.min(1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}
