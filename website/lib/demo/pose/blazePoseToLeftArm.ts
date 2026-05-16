import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

import type { LeftArmChain, PosePoint } from "@/lib/demo/core/poseTypes";

/** MediaPipe Pose 33-point: left shoulder 11, elbow 13, wrist 15 */
const LEFT_SHOULDER = 11;
const LEFT_ELBOW = 13;
const LEFT_WRIST = 15;
const LOW_VISIBILITY = 0.25;

function toPosePoint(lm: NormalizedLandmark): PosePoint {
  const ext = lm as NormalizedLandmark & { presence?: number };
  return {
    x: lm.x,
    y: lm.y,
    z: lm.z,
    visibility: lm.visibility ?? ext.presence,
  };
}

export function leftArmFromBlazePoseLandmarks(
  landmarks: NormalizedLandmark[],
): LeftArmChain | null {
  if (landmarks.length < 16) return null;
  const ls = landmarks[LEFT_SHOULDER];
  const le = landmarks[LEFT_ELBOW];
  const lw = landmarks[LEFT_WRIST];
  if (!ls || !le || !lw) return null;

  const vis = (lm: NormalizedLandmark) => {
    const ext = lm as NormalizedLandmark & { presence?: number };
    return lm.visibility ?? ext.presence ?? 0;
  };
  if (vis(ls) < LOW_VISIBILITY || vis(le) < LOW_VISIBILITY || vis(lw) < LOW_VISIBILITY) {
    return null;
  }

  return {
    leftShoulder: toPosePoint(ls),
    leftElbow: toPosePoint(le),
    leftWrist: toPosePoint(lw),
  };
}
