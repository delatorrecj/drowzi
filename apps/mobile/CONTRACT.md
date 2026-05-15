# Integration surface (v0)

Pin changes during the hackathon; extend types in `src/shared/types.ts`.

## `habit_config` by `habit_type`

| habit_type | Example `habit_config` JSON |
|------------|-----------------------------|
| motion | `{ "configVersion": 1, "repTarget": 10 }` |
| barcode | `{ "configVersion": 1, "barcodeValue": "123..." }` |
| voice | `{ "configVersion": 1, "passageText": "Today I choose momentum." }` |
| pose / meditation | `{ "configVersion": 1, "note": "optional" }` |

## APIs

- **Alarms:** `getAlarms`, `getAlarmById`, `saveAlarm` — `src/platform/alarmStore.ts`
- **Scheduler stubs:** `scheduleAlarm` / `cancelAlarm` — `src/platform/alarmScheduler.ts`
- **Completion:** `recordHabitCompletion` — `src/platform/recordCompletion.ts`
- **Gate UI registry:** `habitGateRegistry` — `src/features/habits/registry.ts`

Router entry from alarms: `router.push(\`/habit-gate/${alarm.id}\`)`.

## Onboarding (PRD US-05)

First launch hits `/` (`app/index.tsx`) → redirects to `/onboarding` until onboarding is marked complete.

**Screens:** (1) welcome / brand, (2) **display name** (optional but encouraged), (3) alarm time + **motion rep target** only (`motion` habit). Environmental / voice setup UI is muted — see `ALARM_SETUP_CATEGORIES` filter in `alarmSetupShared.ts`.

**Finish:** persists via `saveAlarm` — Home shows the first alarm. Display name is stored via `setDisplayName` / `getDisplayName` (`src/platform/onboarding.ts`) for the dashboard greeting.

**Add more alarms:** `app/add-alarm.tsx` — motion-only single screen, then `router.back()`.

**Resume onboarding shortcut:** `/onboarding?resumeStep=1` opens the name step; `resumeStep=2` opens alarm details.

**Skip:** sets AsyncStorage skip flags → Home fires a **one-time** alert; use **`/add-alarm`** or **`/onboarding`** to finish setup.
