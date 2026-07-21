import { NextResponse } from "next/server";

import { chat } from "@/lib/llm/openai";

type VoiceRequest =
  | { action: "generate"; theme?: string }
  | { action: "grade"; passage: string; transcript: string };

const FALLBACK_PASSAGES = [
  "I am awake and ready. Today I choose action over the snooze button.",
  "Morning is mine. I rise, I move, and I begin before the world does.",
  "No more hiding under the covers — I am up, alert, and unstoppable today.",
];

export async function POST(req: Request) {
  let body: VoiceRequest;
  try {
    body = (await req.json()) as VoiceRequest;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (body.action === "generate") {
    const out = await chat(
      [
        {
          role: "system",
          content: "You write short wake-up affirmations to be read aloud to dismiss an alarm.",
        },
        {
          role: "user",
          content: `Write ONE punchy wake-up passage (1-2 sentences, 12-25 words)${
            body.theme ? ` themed around: ${body.theme}` : ""
          }. Plain text only, no quotes, no emoji.`,
        },
      ],
      { maxTokens: 80 },
    );
    // Deterministic fallback (no Math.random at module load): rotate by length.
    const fb = FALLBACK_PASSAGES[(body.theme?.length ?? 0) % FALLBACK_PASSAGES.length];
    return NextResponse.json({ passage: out?.trim().replace(/^["']|["']$/g, "") || fb });
  }

  // grade: semantic "did they read it closely enough" check.
  const out = await chat(
    [
      {
        role: "system",
        content:
          'You grade whether a spoken transcript matches a target passage closely enough to count as "read aloud". Allow minor speech-to-text errors and word swaps. Respond ONLY as JSON: {"pass": boolean, "reason": string}.',
      },
      {
        role: "user",
        content: `TARGET: "${body.passage}"\nTRANSCRIPT: "${body.transcript}"`,
      },
    ],
    { json: true, maxTokens: 80 },
  );

  if (!out) return NextResponse.json({ pass: null }); // client falls back to local match
  try {
    const parsed = JSON.parse(out) as { pass: boolean; reason?: string };
    return NextResponse.json({ pass: !!parsed.pass, reason: parsed.reason ?? "" });
  } catch {
    return NextResponse.json({ pass: null });
  }
}
