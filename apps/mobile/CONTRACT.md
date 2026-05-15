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

- **Alarms:** `getAlarms`, `getAlarmById`, `saveAlarm` (returns `{ scheduling }` — alerts if permission blocks scheduling) — `src/platform/alarmStore.ts`
- **Scheduler:** `scheduleAlarm` / `cancelAlarm` — `src/platform/alarmScheduler.ts` (expo-notifications). **Sounds:** expo-notifications on Android resolves custom files from `res/raw` only; the default alert uses the notification channel tone. **`src/platform/openWakeAlarmSoundSettings.ts`** + **More tab** opens the OS picker so Android users can set the channel to any built-in alarm/ringtone. iOS cannot use the Clock alarm tone for local notifications unless you bundle a `.wav/.caf` in the app (`expo-notifications` plugin `sounds`).
- **Completion:** `recordHabitCompletion` — `src/platform/recordCompletion.ts`
- **Gate UI registry:** `habitGateRegistry` — `src/features/habits/registry.ts`

Router entry from alarms: `router.push(\`/habit-gate/${alarm.id}\`)`.

## Onboarding (PRD US-05)

First launch hits `/` (`app/index.tsx`) → redirects to `/onboarding` until onboarding is marked complete.

**Screens:** (1) welcome / brand, (2) **display name** (optional but encouraged), (3) alarm time + **motion rep target** only (`motion` habit). Environmental / voice setup UI is muted — see `ALARM_SETUP_CATEGORIES` filter in `alarmSetupShared.ts`.

**Finish:** persists via `saveAlarm` — Home shows the first alarm. Display name is stored via `setDisplayName` / `getDisplayName` (`src/platform/onboarding.ts`) for the dashboard greeting.

**Add more alarms:** `app/add-alarm.tsx` — motion-only single screen, then `router.back()`.

**Resume onboarding shortcut:** `/onboarding?resumeStep=1` opens the name step; `resumeStep=2` opens alarm details. If those params are omitted, the app restores the last in-progress step (`onboarding_resume_screen` in AsyncStorage) after the user taps Next at least once.

**Skip:** sets AsyncStorage skip flags → Home fires a **one-time** alert; use **`/add-alarm`** or **`/onboarding`** to finish setup.
