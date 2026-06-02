import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "public", "models", "pose_landmarker_lite.task");
const url =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

try {
  await access(outPath);
  process.exit(0);
} catch {
  /* download */
}

await mkdir(dirname(outPath), { recursive: true });
const res = await fetch(url);
if (!res.ok) {
  console.warn(`[drowzi] Could not download pose model (${res.status}). Demo will use CDN fallback.`);
  process.exit(0);
}
const buf = Buffer.from(await res.arrayBuffer());
await writeFile(outPath, buf);
console.log("[drowzi] Downloaded pose_landmarker_lite.task");
