import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

import type { LegChain, LegChains, PosePoint } from "@/lib/demo/core/poseTypes";

/** MediaPipe Pose 33-point leg indices. */
const LEFT_HIP = 23;
const LEFT_KNEE = 25;
const LEFT_ANKLE = 27;
const RIGHT_HIP = 24;
const RIGHT_KNEE = 26;
const RIGHT_ANKLE = 28;
const LOW_VISIBILITY = 0.25;

function vis(lm: NormalizedLandmark): number {
  const ext = lm as NormalizedLandmark & { presence?: number };
  return lm.visibility ?? ext.presence ?? 0;
}

function toPosePoint(lm: NormalizedLandmark): PosePoint {
  const ext = lm as NormalizedLandmark & { presence?: number };
  return { x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility ?? ext.presence };
}

function legChain(
  landmarks: NormalizedLandmark[],
  hipI: number,
  kneeI: number,
  ankleI: number,
): LegChain | null {
  const hip = landmarks[hipI];
  const knee = landmarks[kneeI];
  const ankle = landmarks[ankleI];
  if (!hip || !knee || !ankle) return null;
  if (vis(hip) < LOW_VISIBILITY || vis(knee) < LOW_VISIBILITY || vis(ankle) < LOW_VISIBILITY) {
    return null;
  }
  return { hip: toPosePoint(hip), knee: toPosePoint(knee), ankle: toPosePoint(ankle) };
}

/** Both hip-knee-ankle chains; a side is null unless all 3 joints are visible. */
export function legsFromBlazePoseLandmarks(landmarks: NormalizedLandmark[]): LegChains {
  if (landmarks.length < 29) return { left: null, right: null };
  return {
    left: legChain(landmarks, LEFT_HIP, LEFT_KNEE, LEFT_ANKLE),
    right: legChain(landmarks, RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE),
  };
}
