# GEMINI.md - Drowzi Project Context

This file provides architectural overview, development conventions, and operational instructions for the **Drowzi** project.

## 1. Project Overview
**Drowzi** is a habit-gated wake-up application designed to combat sleep inertia by requiring physical or cognitive tasks to silence alarms.

- **Mobile App (`apps/mobile/`):** An Expo-based React Native application using TypeScript. It features on-device machine learning for habit verification (e.g., push-up counting via pose estimation).
- **Website (`website/`):** A Next.js landing page built with TypeScript and Tailwind CSS.
- **Docs (`docs/`):** Comprehensive documentation including PRD, SDD, RFCs, and Onboarding strategies.

## 2. Core Architecture & Tech Stack
- **Framework:** Expo (SDK 54), React Native (0.81), React 19.
- **Language:** TypeScript (Strict).
- **State Management:** React Context / Local State.
- **Persistence:** 
    - **Local:** Expo SQLite (Offline-first source of truth for alarms and habit logs).
    - **Cloud:** Supabase (Auth, streak synchronization, backup).
- **ML / Sensors:** 
    - `react-native-fast-tflite` for MoveNet pose estimation.
    - Google ML Kit for Barcode scanning.
    - Platform OS APIs for Voice recognition.
- **Routing:** Expo Router.
- **Validation:** Zod.

## 3. Development Commands

### Mobile App (`apps/mobile/`)
- **Install:** `npm install`
- **Start Expo:** `npm run start`
- **Run Android:** `npm run android`
- **Run iOS:** `npm run ios`
- **Run Web:** `npm run web`
- **Typecheck:** `npm run typecheck`
- **Test:** `npm test` (Jest)
- **ADB Reverse:** `npm run adb:reverse` (for physical Android device debugging)

### Website (`website/`)
- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

## 4. Key Directories & File Roles
- `apps/mobile/app/`: Expo Router file-based routing.
- `apps/mobile/src/features/`: Feature-scoped logic (alarm, habits, pushup).
- `apps/mobile/src/platform/`: OS and hardware-level abstractions (SQLite, Notifications, Storage).
- `apps/mobile/src/shared/`: Shared types, constants, and themes.
- `docs/`: Product and technical design documents.
- `website/app/`: Next.js App Router pages.

## 5. Development Conventions & Principles
- **Offline-First:** All core alarm and habit-gate functionality must work without network connectivity.
- **On-Device ML:** Avoid cloud-based ML for latency and privacy; use TFLite or Platform SDKs.
- **Surgical Changes:** When modifying the mobile app, respect the existing `src/platform` vs `src/features` separation.
- **Type Safety:** Maintain strict TypeScript typing. Use Zod for any external or dynamic data validation.
- **Mascot Integrity:** Adhere to the "Sleepy Bear" design guidelines (Honey Gold `#F7D302`, Awakening Yellow `#F4C430`, Action Red `#E63946`).
- **Habit Gates:** New habit types should be registered in `src/features/habits/registry.ts` and implement the common interface defined in `src/features/habits/gates/types.ts`.

## 6. Verification & Quality Assurance
- **Tests:** Always run `npm test` in the relevant package directory after changes.
- **Type Checking:** Run `npm run typecheck` in `apps/mobile/` before finalizing changes.
- **Manual Check:** Ensure that alarm scheduling logic (`alarmScheduler.ts`) and completion logging (`recordCompletion.ts`) are tested for regression.

## 7. Current Project Status & TODOs
- **V1 Focus:** Pose-based push-up verification and barcode scanning.
- **Muted Features:** Voice and cognitive habits are currently muted in the UI but defined in `CONTRACT.md`.
- **Backend:** Supabase integration is in progress; local SQLite remains the primary source of truth.
