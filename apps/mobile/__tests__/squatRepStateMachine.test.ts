import { createSquatRepMachine } from '@/src/features/exercise/detectors/squatRepStateMachine';

describe('createSquatRepMachine', () => {
  it('counts one rep for up to down to up', () => {
    const m = createSquatRepMachine({
      targetReps: 3,
      extendedMinDeg: 160,
      bentMaxDeg: 100,
    });
    m.feedKneeAngleDeg(170);
    m.feedKneeAngleDeg(90);
    m.feedKneeAngleDeg(165);
    expect(m.snapshot().reps).toBe(1);
  });
});
