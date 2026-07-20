/**
 * Domain shapes aligned with docs/sdd-drowzi.md (local-first).
 * Extend when Supabase sync lands.
 */

export type HabitType = 'motion' | 'barcode' | 'voice' | 'pose' | 'meditation';

export type Recurrence =
  | { type: 'daily' }
  | { type: 'weekdays' }
  | { type: 'once'; date: string }
  | { type: 'weekly'; days: number[] };

export type MotionExerciseId = 'pushups' | 'squats' | 'jumping_jacks' | 'generic_motion';

export type PoseExerciseId = 'warrior_i';

export type ExerciseId = MotionExerciseId | PoseExerciseId;

export type MotionHabitConfigV1 = { configVersion: 1; repTarget: number };

export type MotionHabitConfig = {
  configVersion: 2;
  exerciseId: MotionExerciseId;
  repTarget: number;
};

export type PoseHabitConfig = {
  configVersion: 2;
  exerciseId: PoseExerciseId;
  holdDurationSeconds: number;
};

export type BarcodeHabitConfig = { configVersion: 1; barcodeValue: string };

export type VoiceHabitConfig = { configVersion: 1; passageText: string };

export type PlaceholderHabitConfig = { configVersion: 1; note?: string };

export type HabitConfig =
  | MotionHabitConfigV1
  | MotionHabitConfig
  | PoseHabitConfig
  | BarcodeHabitConfig
  | VoiceHabitConfig
  | PlaceholderHabitConfig;

export type Alarm = {
  id: string;
  userId: string;
  time: string;
  recurrence: Recurrence;
  habitType: HabitType;
  habitConfig: HabitConfig;
  isActive: boolean;
  createdAt: string;
};

export type HabitLogMethod = 'verified' | 'fallback_timer' | 'force_closed';

export type HabitCompletionPayload = {
  alarmId: string;
  habitType: HabitType;
  success: boolean;
  method: HabitLogMethod;
  /** ISO date (calendar day) in user's timezone — v0 uses device local via YYYY-MM-DD */
  localDate: string;
};
