import { describe, expect, it } from "vitest";

import { calculateAngle2D } from "@/lib/demo/core/geometry";
import { createSquatRepMachine } from "@/lib/demo/core/squatRepStateMachine";
import type { LegChain, LegChains } from "@/lib/demo/core/poseTypes";

// Straight leg (~180°) vs bent knee (~90°), 2D.
const STRAIGHT: LegChain = {
  hip: { x: 0, y: 0 },
  knee: { x: 0, y: 1 },
  ankle: { x: 0, y: 2 },
};
const BENT: LegChain = {
  hip: { x: 0, y: 0 },
  knee: { x: 0, y: 1 },
  ankle: { x: 1, y: 1 },
};

const cfg = { targetReps: 3, standMinDeg: 160, squatMaxDeg: 110, smoothingAlpha: 1 };

function legs(left: LegChain | null, right: LegChain | null): LegChains {
  return { left, right };
}

describe("calculateAngle2D", () => {
  it("ignores z (straight line in xy is 180 even with z noise)", () => {
    const a = { x: 0, y: 0, z: 5 };
    const b = { x: 1, y: 0, z: -3 };
    const c = { x: 2, y: 0, z: 9 };
    expect(calculateAngle2D(a, b, c)).toBeCloseTo(180, 5);
  });
});

describe("createSquatRepMachine", () => {
  it("counts one rep on both-knee stand→squat→stand", () => {
    const m = createSquatRepMachine(cfg);
    let t = 0;
    m.feedLegs(legs(STRAIGHT, STRAIGHT), (t += 100)); // standing
    m.feedLegs(legs(BENT, BENT), (t += 100)); // bottom
    m.feedLegs(legs(STRAIGHT, STRAIGHT), (t += 100)); // stand -> rep
    expect(m.snapshot().reps).toBe(1);
  });

  it("still counts with only one leg visible (averages valid angles)", () => {
    const m = createSquatRepMachine(cfg);
    let t = 0;
    m.feedLegs(legs(STRAIGHT, null), (t += 100));
    m.feedLegs(legs(BENT, null), (t += 100));
    m.feedLegs(legs(STRAIGHT, null), (t += 100));
    expect(m.snapshot().reps).toBe(1);
  });

  it("does not double-count within min rep interval", () => {
    const m = createSquatRepMachine({ ...cfg, minRepIntervalMs: 400 });
    // First rep at t=200.
    m.feedKneeAngleDeg(170, 0);
    m.feedKneeAngleDeg(95, 100);
    m.feedKneeAngleDeg(170, 200);
    // Second full cycle too soon (t=350) — debounced.
    m.feedKneeAngleDeg(95, 300);
    m.feedKneeAngleDeg(170, 350);
    expect(m.snapshot().reps).toBe(1);
  });

  it("returns null knee angle when no legs are tracked", () => {
    const m = createSquatRepMachine(cfg);
    expect(m.kneeAngleFromLegs(legs(null, null))).toBeNull();
  });
});
