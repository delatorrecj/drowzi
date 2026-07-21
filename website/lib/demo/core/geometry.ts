import type { PosePoint } from "@/lib/demo/core/poseTypes";

/** Angle at b for segments (a->b) and (c->b), degrees [0, 180]. */
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

/**
 * Angle at b using only x/y. Monocular z from a single webcam is unreliable
 * (BlazePose infers depth), so 2D is far more stable for knee/elbow angles.
 */
export function calculateAngle2D(a: PosePoint, b: PosePoint, c: PosePoint): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;

  const dot = abx * cbx + aby * cby;
  const magAb = Math.hypot(abx, aby);
  const magCb = Math.hypot(cbx, cby);
  if (magAb === 0 || magCb === 0) return NaN;

  const cos = Math.max(-1, Math.min(1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}
