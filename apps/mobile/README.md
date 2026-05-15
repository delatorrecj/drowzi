# Drowzi mobile

Expo (SDK 54) + Expo Router + TypeScript. See repo `docs/` for product and system design.

## Run

```bash
cd apps/mobile
npm install
npm run start
```

- **typecheck:** `npm run typecheck`

## Expo Go on a physical phone (when QR / “something went wrong”)

Metro may pick a **bad Windows IP** (e.g. `172.24.*` from Hyper-V/WSL). Your phone then cannot load `exp://172.24.x.x:8081`.

**USB Android (your log shows a device ID):**

1. With the phone connected and USB debugging on, run once per reconnect:
   ```bash
   npm run adb:reverse
   ```
   (`adb` must be on your PATH — Android SDK `platform-tools`.)

2. Start Metro in **localhost mode** (pairs with `adb reverse`):
   ```bash
   npm run start:usb
   ```

3. Press `a` to open in Expo Go, or scan the QR again.

**Wi‑Fi instead:** Use `npm run start:tunnel` (works across networks) or set your real Wi‑Fi IPv4 then start:

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME = "192.168.x.x"
npm run start
```

**Also:** Pressing `w` only opens **web**; ignore `[web]` logs when debugging Expo Go on device.

## Layout

| Path | Owner (see `docs/plan-dev-workflow-split.md`) |
|------|-----------------------------------------------|
| `src/platform/` | Notifications, **local persistence** (AsyncStorage), alarm scheduling |
| `src/features/habits/` | Habit gates + `registry.ts` |
| `src/features/dashboard/` | Dashboard mascot placeholder + layout helpers |
| `assets/dashboard/` | Pixel mascot PNGs — see `ASSETS.md` |
| `src/shared/` | Types, themes (`dashboardTheme`, palette), Zod habit config parsing |
| `app/` | Routes only — keep thin |

Integration cheat sheet: `CONTRACT.md`.

## Env

Optional: `.env.example` — only if you add backend keys later; **V1 in this repo is local-only**.
