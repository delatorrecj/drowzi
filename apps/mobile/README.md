# Drowzi mobile

Expo (SDK 54) + Expo Router + TypeScript. See repo `docs/` for product and system design.

## Run

```bash
cd apps/mobile
npm install
npm run start
```

- **typecheck:** `npm run typecheck`

## Layout

| Path | Owner (see `docs/plan-dev-workflow-split.md`) |
|------|-----------------------------------------------|
| `src/platform/` | Notifications, persistence, sync, alarm scheduling |
| `src/features/habits/` | Habit gates + `registry.ts` |
| `src/shared/` | Types, theme, Zod habit config parsing |
| `app/` | Routes only — keep thin |

Integration cheat sheet: `CONTRACT.md`.

## Env (later)

Copy `.env.example` to `.env` — never commit secrets.
