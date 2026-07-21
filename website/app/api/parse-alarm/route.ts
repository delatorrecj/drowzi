import { NextResponse } from "next/server";
import { z } from "zod";

import { chat } from "@/lib/llm/openai";
import { parseHabitConfig } from "@/lib/demo/habitConfigSchema";
import type { HabitType } from "@/lib/demo/types";

// What the client needs to build an alarm.
const parsed = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  habitType: z.enum(["motion", "barcode", "voice"]),
  habitConfig: z.unknown(),
  label: z.string().optional(),
});

type ParsedAlarm = {
  time: string;
  habitType: HabitType;
  habitConfig: unknown;
  label?: string;
};

/** Regex fallback: pull a time + guess habit from keywords. */
function fallbackParse(text: string): ParsedAlarm {
  const t = text.toLowerCase();
  let time = "07:00";
  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    if (m[3] === "pm" && h < 12) h += 12;
    if (m[3] === "am" && h === 12) h = 0;
    if (h <= 23 && min <= 59) time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }
  const repM = t.match(/(\d+)\s*(push|squat|rep|pushup|push-up)/);
  const reps = repM ? Math.min(500, Math.max(1, parseInt(repM[1], 10))) : 5;
  if (t.includes("voice") || t.includes("read") || t.includes("say")) {
    return { time, habitType: "voice", habitConfig: { configVersion: 1, passageText: "I am awake and ready to start my day." } };
  }
  if (t.includes("barcode") || t.includes("scan")) {
    return { time, habitType: "barcode", habitConfig: { configVersion: 1, barcodeValue: "DROWZI-DEMO-001" } };
  }
  return { time, habitType: "motion", habitConfig: { configVersion: 1, repTarget: reps } };
}

export async function POST(req: Request) {
  let text: string;
  try {
    text = String(((await req.json()) as { text?: string }).text ?? "").slice(0, 300);
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!text.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });

  const out = await chat(
    [
      {
        role: "system",
        content:
          'Parse a natural-language alarm request into JSON. Fields: time ("HH:MM" 24h), habitType ("motion"=exercise reps, "voice"=read passage, "barcode"=scan), habitConfig, label (short). habitConfig shapes: motion={configVersion:1,repTarget:int}, voice={configVersion:1,passageText:string}, barcode={configVersion:1,barcodeValue:string}. Respond ONLY with JSON.',
      },
      { role: "user", content: text },
    ],
    { json: true, maxTokens: 150 },
  );

  let result: ParsedAlarm = fallbackParse(text);
  if (out) {
    try {
      const raw = parsed.parse(JSON.parse(out));
      // Validate habitConfig against the real schema; throws → keep fallback.
      const habitConfig = parseHabitConfig(raw.habitType, raw.habitConfig);
      result = { time: raw.time, habitType: raw.habitType, habitConfig, label: raw.label };
    } catch {
      /* keep regex fallback */
    }
  }
  return NextResponse.json(result);
}
