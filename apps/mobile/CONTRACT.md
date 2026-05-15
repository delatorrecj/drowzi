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
