import type { Alarm } from "@/lib/demo/types";

export const DEMO_VOICE_PASSAGE =
  "I am awake. I am ready. Today I will complete my morning habit before the day begins.";

export const DEMO_BARCODE_VALUE = "DROWZI-DEMO-001";

export const POSE_MODEL_PATH = "/models/pose_landmarker_lite.task";
export const POSE_MODEL_CDN =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export const DEFAULT_EXTENDED_MIN = 160;
export const DEFAULT_BENT_MAX = 90;
export const DEFAULT_REP_TARGET = 5;

export function createDemoAlarm(
  habitType: Alarm["habitType"],
  habitConfig: Alarm["habitConfig"],
  id?: string,
): Alarm {
  const now = new Date().toISOString();
  return {
    id: id ?? `demo-${habitType}-${Date.now()}`,
    userId: "demo-user",
    time: "07:00",
    recurrence: { type: "daily" },
    habitType,
    habitConfig,
    isActive: true,
    createdAt: now,
  };
}

export const DEMO_ALARMS: Alarm[] = [
  createDemoAlarm("motion", { configVersion: 1, repTarget: DEFAULT_REP_TARGET }, "demo-motion"),
  createDemoAlarm("barcode", { configVersion: 1, barcodeValue: DEMO_BARCODE_VALUE }, "demo-barcode"),
  createDemoAlarm("voice", { configVersion: 1, passageText: DEMO_VOICE_PASSAGE }, "demo-voice"),
];
