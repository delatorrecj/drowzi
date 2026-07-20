import { torsoHorizontal, torsoVertical } from '@/src/features/exercise/validators';
import { createRepMachine } from '@/src/features/exercise/repStateMachine';
import { BLAZEPOSE, type PoseLandmarks33 } from '@/src/features/exercise/landmarks';

function bodyFrame(shoulder: { x: number; y: number }, hip: { x: number; y: number }): PoseLandmarks33 {
  const lm: PoseLandmarks33 = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.9 }));
  lm[BLAZEPOSE.leftShoulder] = { x: shoulder.x - 0.05, y: shoulder.y, visibility: 0.9 };
  lm[BLAZEPOSE.rightShoulder] = { x: shoulder.x + 0.05, y: shoulder.y, visibility: 0.9 };
  lm[BLAZEPOSE.leftHip] = { x: hip.x - 0.05, y: hip.y, visibility: 0.9 };
  lm[BLAZEPOSE.rightHip] = { x: hip.x + 0.05, y: hip.y, visibility: 0.9 };
  return lm;
}

describe('torso orientation validators', () => {
  const standing = bodyFrame({ x: 0.5, y: 0.3 }, { x: 0.5, y: 0.6 }); // tall
  const planking = bodyFrame({ x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }); // wide

  it('torsoVertical accepts standing, rejects planking', () => {
    expect(torsoVertical(standing)).toBe(true);
    expect(torsoVertical(planking)).toBe(false);
  });

  it('torsoHorizontal accepts planking, rejects standing', () => {
    expect(torsoHorizontal(planking)).toBe(true);
    expect(torsoHorizontal(standing)).toBe(false);
  });
});

describe('minRepIntervalMs anti-cheat', () => {
  it('does not count a second rep that arrives too soon', () => {
    let clock = 0;
    const m = createRepMachine({
      targetReps: 5,
      isActive: (a) => a <= 90,
      isRest: (a) => a >= 160,
      minRepIntervalMs: 350,
      now: () => clock,
    });
    const doRep = () => {
      for (const a of [175, 170, 80, 75, 170, 175]) m.feed(a);
    };
    doRep(); // t=0, counts
    clock = 100; // 100ms later — too soon
    doRep();
    expect(m.snapshot().reps).toBe(1);
    clock = 600; // well past interval
    doRep();
    expect(m.snapshot().reps).toBe(2);
  });
});
