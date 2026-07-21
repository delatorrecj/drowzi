import { describe, expect, it } from "vitest";

import { calculateAngle } from "@/lib/demo/core/geometry";
import { createPushUpRepMachine } from "@/lib/demo/core/pushUpRepStateMachine";

describe("calculateAngle", () => {
  it("returns 180 for a straight line", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 2, y: 0 };
    expect(calculateAngle(a, b, c)).toBeCloseTo(180, 5);
  });

  it("returns ~90 for a right angle", () => {
    const shoulder = { x: 0, y: 0 };
    const elbow = { x: 0, y: 1 };
    const wrist = { x: 1, y: 1 };
    expect(calculateAngle(shoulder, elbow, wrist)).toBeCloseTo(90, 5);
  });
});

describe("createPushUpRepMachine", () => {
  it("counts one rep for top to bottom to top", () => {
    const m = createPushUpRepMachine({
      targetReps: 5,
      extendedMinDeg: 160,
      bentMaxDeg: 90,
    });
    // EMA smoothing needs a few frames per phase to converge (real webcam feeds ~30fps).
    for (let i = 0; i < 6; i++) m.feedElbowAngleDeg(80);
    for (let i = 0; i < 6; i++) m.feedElbowAngleDeg(170);
    expect(m.snapshot().reps).toBe(1);
  });

  it("does not count a rep from a single stray extended frame", () => {
    const m = createPushUpRepMachine({ targetReps: 5, extendedMinDeg: 160, bentMaxDeg: 90 });
    for (let i = 0; i < 6; i++) m.feedElbowAngleDeg(40); // enter bottom
    m.feedElbowAngleDeg(175); // one noisy frame; EMA keeps smoothed well below 160
    expect(m.snapshot().reps).toBe(0);
  });

  it("debounces reps closer than minRepIntervalMs when timestamps are given", () => {
    const m = createPushUpRepMachine({
      targetReps: 5,
      extendedMinDeg: 160,
      bentMaxDeg: 90,
      minRepIntervalMs: 400,
    });
    const drive = (angle: number, startTs: number) => {
      for (let i = 0; i < 6; i++) m.feedElbowAngleDeg(angle, startTs + i * 10);
    };
    drive(40, 0);
    drive(175, 100); // rep 1
    expect(m.snapshot().reps).toBe(1);

    drive(40, 200);
    drive(175, 300); // within 400ms of rep 1 → debounced
    expect(m.snapshot().reps).toBe(1);

    drive(40, 1000);
    drive(175, 1100); // well past the interval → counts
    expect(m.snapshot().reps).toBe(2);
  });
});
