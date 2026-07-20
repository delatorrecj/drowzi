export type RepPhase = 'rest' | 'active';

export type RepMachineConfig = {
  targetReps: number;
  /** Enter the active half of a rep (e.g. arm bent, knee down). */
  isActive: (metric: number) => boolean;
  /** Return to rest and count the rep (e.g. arm extended, standing). */
  isRest: (metric: number) => boolean;
  /**
   * Consecutive frames a crossing predicate must hold before the phase flips.
   * Debounce that kills single-noisy-frame double-counts.
   * ponytail: default 2 tuned for fpsMode 15; raise if jitter, lower if fast reps get swallowed.
   */
  minPhaseFrames?: number;
  /**
   * EMA factor on the metric (1 = no smoothing, the default). Lower = smoother
   * but more lag — at fpsMode 15 heavy smoothing can swallow fast reps, so the
   * frame debounce (minPhaseFrames) does the jitter rejection by default.
   * ponytail: opt-in calibration knob; turn down only if a device is noisy.
   */
  smoothingAlpha?: number;
  /**
   * Anti-cheat: minimum wall-clock ms between counted reps. A transition that
   * arrives sooner still flips the phase but is not counted (physically
   * impossible rep burst). ponytail: ~350ms is below human cadence floor.
   */
  minRepIntervalMs?: number;
  /** Injectable clock for deterministic tests; defaults to Date.now. */
  now?: () => number;
};

export type RepMachineState = {
  phase: RepPhase;
  reps: number;
};

/**
 * Generic two-phase hysteresis rep counter with metric smoothing + debounce.
 * Replaces the per-exercise push-up/squat/jumping-jack machines that were
 * identical apart from comparator direction. Feed it a scalar metric
 * (joint angle, openness 0/1, movement energy); it counts a rep on each
 * active -> rest transition.
 */
export function createRepMachine(config: RepMachineConfig) {
  const { targetReps } = config;
  const minPhaseFrames = config.minPhaseFrames ?? 2;
  const alpha = config.smoothingAlpha ?? 1;
  const minRepIntervalMs = config.minRepIntervalMs ?? 0;
  const now = config.now ?? Date.now;

  let phase: RepPhase = 'rest';
  let reps = 0;
  let ema: number | null = null;
  let pending = 0;
  let lastRepAt = -Infinity;

  function feed(metric: number): boolean {
    if (!Number.isFinite(metric)) return reps >= targetReps;

    ema = ema === null ? metric : alpha * metric + (1 - alpha) * ema;
    const m = ema;

    const crossing = phase === 'rest' ? config.isActive(m) : config.isRest(m);
    if (crossing) {
      pending += 1;
      if (pending >= minPhaseFrames) {
        pending = 0;
        if (phase === 'rest') {
          phase = 'active';
        } else {
          phase = 'rest';
          const t = now();
          if (t - lastRepAt >= minRepIntervalMs) {
            reps += 1;
            lastRepAt = t;
          }
        }
      }
    } else {
      pending = 0;
    }
    return reps >= targetReps;
  }

  function snapshot(): RepMachineState {
    return { phase, reps };
  }

  return { feed, snapshot };
}

export type RepMachine = ReturnType<typeof createRepMachine>;
