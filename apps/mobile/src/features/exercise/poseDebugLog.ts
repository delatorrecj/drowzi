/**
 * Throttled console logger for the pose pipeline. At 15fps a per-frame log
 * floods Metro; this emits at most once per `everyMs` per tag so you can see
 * the pipeline is alive without drowning in output. Always logs the FIRST hit
 * of each tag so a stage that fires once (then stops) is still visible.
 */
const lastAt: Record<string, number> = {};

export function poseLog(tag: string, everyMs: number, ...args: unknown[]): void {
  if (!__DEV__) return;
  const now = Date.now();
  const prev = lastAt[tag];
  if (prev !== undefined && now - prev < everyMs) return;
  lastAt[tag] = now;
  // eslint-disable-next-line no-console
  console.log(`[pose:${tag}]`, ...args);
}

/** Reset throttle state (e.g. when a gate remounts) so first-hit logs fire again. */
export function poseLogReset(): void {
  for (const k of Object.keys(lastAt)) delete lastAt[k];
}
