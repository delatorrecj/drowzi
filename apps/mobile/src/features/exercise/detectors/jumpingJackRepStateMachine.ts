export type JumpingJackPhase = 'closed' | 'open';

export type JumpingJackMachineConfig = {
  targetReps: number;
};

export function createJumpingJackRepMachine(config: JumpingJackMachineConfig) {
  const { targetReps } = config;
  let phase: JumpingJackPhase = 'closed';
  let reps = 0;

  /** Wrists above shoulders and ankles wider than hips. */
  function feedOpenSignal(isOpen: boolean): boolean {
    if (phase === 'closed') {
      if (isOpen) phase = 'open';
    } else if (!isOpen) {
      phase = 'closed';
      reps += 1;
    }
    return reps >= targetReps;
  }

  return {
    feedOpenSignal,
    snapshot: () => ({ phase, reps }),
  };
}
