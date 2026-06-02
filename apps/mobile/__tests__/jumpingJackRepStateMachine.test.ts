import { createJumpingJackRepMachine } from '@/src/features/exercise/detectors/jumpingJackRepStateMachine';

describe('createJumpingJackRepMachine', () => {
  it('counts one rep for closed to open to closed', () => {
    const m = createJumpingJackRepMachine({ targetReps: 5 });
    m.feedOpenSignal(false);
    m.feedOpenSignal(true);
    m.feedOpenSignal(false);
    expect(m.snapshot().reps).toBe(1);
  });
});
