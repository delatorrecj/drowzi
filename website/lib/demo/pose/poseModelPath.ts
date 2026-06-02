import { POSE_MODEL_CDN, POSE_MODEL_PATH } from "@/lib/demo/demoDefaults";

export async function resolvePoseModelPath(): Promise<string> {
  try {
    const res = await fetch(POSE_MODEL_PATH, { method: "HEAD" });
    if (res.ok) return POSE_MODEL_PATH;
  } catch {
    /* use CDN */
  }
  return POSE_MODEL_CDN;
}
