import { NextResponse } from "next/server";

import { chat } from "@/lib/llm/openai";

type CoachRequest = {
  exercise: "pushup" | "squat";
  reps: number;
  target: number;
  minAngleDeg?: number | null; // deepest angle reached (squat knee / pushup elbow)
  targetAngleDeg?: number; // depth threshold they had to hit
};

function fallbackTip(b: CoachRequest): string {
  const done = b.reps >= b.target;
  if (b.exercise === "squat") {
    if (b.minAngleDeg != null && b.targetAngleDeg != null && b.minAngleDeg > b.targetAngleDeg + 8) {
      return `You bottomed out at ${Math.round(b.minAngleDeg)}° — aim for ${b.targetAngleDeg}°. Sit a little deeper next time.`;
    }
    return done ? "Clean squats — solid depth. Good morning work." : "Keep going, drive through your heels.";
  }
  return done ? "Strong push-ups — full lockout at the top. Nice." : "Keep your core tight and lower all the way down.";
}

export async function POST(req: Request) {
  let body: CoachRequest;
  try {
    body = (await req.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const prompt = `User just finished a wake-up ${body.exercise} set: ${body.reps}/${body.target} reps. ${
    body.minAngleDeg != null
      ? `Deepest ${body.exercise === "squat" ? "knee" : "elbow"} angle: ${Math.round(body.minAngleDeg)}° (target ${body.targetAngleDeg}°).`
      : ""
  } Give ONE short, punchy coaching line (max 20 words) — form tip if the depth was shallow, else quick encouragement. No emoji, no preamble.`;

  const tip = await chat(
    [
      { role: "system", content: "You are Drowzi, a terse, upbeat morning workout coach." },
      { role: "user", content: prompt },
    ],
    { maxTokens: 60 },
  );

  return NextResponse.json({ tip: tip?.trim() || fallbackTip(body) });
}
