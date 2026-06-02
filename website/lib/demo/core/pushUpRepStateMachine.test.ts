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
    m.feedElbowAngleDeg(170);
    m.feedElbowAngleDeg(80);
    m.feedElbowAngleDeg(165);
    expect(m.snapshot().reps).toBe(1);
  });
});
