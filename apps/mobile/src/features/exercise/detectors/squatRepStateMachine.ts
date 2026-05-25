export type SquatPhase = 'up' | 'down';

export type SquatMachineConfig = {
  extendedMinDeg: number;
  bentMaxDeg: number;
  targetReps: number;
};

export function createSquatRepMachine(config: SquatMachineConfig) {
  const { extendedMinDeg, bentMaxDeg, targetReps } = config;
  let phase: SquatPhase = 'up';
  let reps = 0;

  function feedKneeAngleDeg(angle: number): boolean {
    if (!Number.isFinite(angle)) return reps >= targetReps;
    if (phase === 'up') {
      if (angle <= bentMaxDeg) phase = 'down';
    } else {
      if (angle >= extendedMinDeg) {
        phase = 'up';
        reps += 1;
      }
    }
    return reps >= targetReps;
  }

  return {
    feedKneeAngleDeg,
    snapshot: () => ({ phase, reps }),
  };
}
