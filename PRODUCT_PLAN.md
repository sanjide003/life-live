# Livelife Product Plan

## Current application assessment

This repository is a Flutter mobile application. It now has a Life OS visual prototype, but it is not yet a production personal management system. The app still needs real navigation, data models, local storage, cloud sync, permissions, authentication, Health Connect / Google Fit integration, notifications, reports, and offline summary logic.

## Locked product decisions

- Product language: English only.
- Platform priority: Android first.
- Authentication: no login required for the first release; optional Google login can be added when Firebase sync starts.
- Storage: offline-first local storage plus automatic Firebase sync is required.
- First-version sensitive scope: do not include password vault, ID documents, SMS parsing, or location history.
- Finance: Indian Rupee currency, bank/UPI treated as the same account source, basic reports required, advanced categories/budget rules/tax/GST marked as coming soon.
- Health: manual entry plus Health Connect / Google Fit integration is required, with first-version priority on steps, sleep duration, water intake, weight, exercise/workout, mood, and medicine tracking.
- Prayer: support multiple calculation methods with automatic location, manual location, manual time adjustment, Hanafi/Shafi'i Asr options, timezone/daylight handling, and settings-based changes.
- Business: remove business-management features from the first personal version.
- AI: offline summaries first; OpenAI-powered or configurable AI providers can be added later.
- Design: modern Android-first Material 3 style, blue/indigo primary color, clean cards, dark-mode support later, dashboard priority set by daily use value.
- Logo: custom logo package required before final app branding; no text inside the icon.
- Backend: Firebase is the final backend for auth, database, file storage, synchronization, notifications, user management, and security rules.

## Final architecture decisions

### Logo assets

Create and place these files in the project assets folder before final branding is wired into launch icons and splash screens:

- `app_logo.svg` — master vector logo.
- `app_logo_1024.png` — 1024 x 1024 master PNG.
- `app_logo_512.png` — 512 x 512 PNG.
- `app_logo_192.png` — 192 x 192 PNG.
- `app_logo_180.png` — 180 x 180 PNG.
- `app_logo_96.png` — 96 x 96 PNG.
- `app_logo_72.png` — 72 x 72 PNG.
- `app_logo_48.png` — 48 x 48 PNG.
- `favicon.ico`, `favicon-32.png`, and `favicon-16.png`.
- `splash_logo.png` — 1024 x 1024 transparent PNG.
- `adaptive_foreground.png` — 1024 x 1024 transparent PNG.
- `adaptive_background.png` — 1024 x 1024 solid-background PNG.

Logo guidelines: modern, minimal, rounded, flat, high contrast, recognizable at small sizes, compatible with light and dark mode, and no text inside the icon.

### Firebase backend

Firebase is the final cloud provider and backend. It will be used for optional Google authentication, cloud database, cloud storage, backup and sync, push notifications, user management, security rules, optional analytics, and optional crash reporting. The app must remain offline-first: data is written locally first and synchronized automatically when internet access is available.

### Prayer calculation

The prayer system must not hardcode one method. It should support multiple calculation methods, automatic location-based calculation, manual location selection, manual prayer time adjustment, Hanafi/Shafi'i Asr options, automatic daylight/time-zone handling, and user-controlled method changes from Settings.

### Health metric priority

Primary first-version metrics are steps, sleep duration, water intake, weight, exercise/workout, mood, and medicine tracking. Secondary metrics are heart rate, blood pressure, blood sugar, calories burned, distance walked, active minutes, and BMI.

## Product direction

Livelife is a personal Life Operating System: a private Android-first command center for daily planning, habits, goals, health, finance, prayer, notes, documents-lite, learning, reminders, reviews, and offline summaries.

## Implementation status

- Update 1 completed: Android-first Material 3 app shell with bottom navigation and reusable UI components.
- Update 2 completed: local-first model and repository interfaces with seeded in-memory data ready for future SQLite/Isar/Hive and Firebase sync adapters.
- Update 3 completed: Daily Planner, Tasks, Goals, and Habits MVP with create/edit/complete flows where reasonable.
- Update 4 completed: personal INR finance MVP with Bank/UPI, income, expenses, bills, monthly summary, cash flow, basic reports, and advanced finance marked coming soon.
- Update 5 completed: prayer module with five daily prayers, completion tracking, progress summary, and placeholders for calculation settings, reminders, Quran, dhikr, dua, Ramadan, and charity.
- Update 6 completed: health dashboard with priority manual metrics and a permission-first Health Connect / Google Fit boundary.
- Update 7 completed: daily, weekly, and monthly reports with offline rule-based local suggestions.
- Update 8 completed: local persistence boundary with schema-versioned serialization, metadata timestamps, and repository re-creation tests.
- Update 9 completed: Firebase-ready optional Google login state and signed-out local-first UI; no forced login.
- Update 10 completed: Firebase sync adapter boundary with sync status, queued-write status, conflict strategy, export/import and privacy controls.
- Update 11 completed: CRUD actions for enabled modules including finance, health, goals, notes, and daily reviews while advanced/sensitive modules remain disabled.
- Update 12 completed: local notification permission boundary, reminder preferences, safe defaults, and scheduling logic for tasks, habits, prayers, bills, and daily closing reports.
- Update 13 completed: Health Connect / Google Fit consent boundary with permission states and allowed-read support for steps, sleep, exercise, and weight.
- App identity update completed: project/package references standardized to `livelife`, visible app name set to `Livelife`, Android package set to `com.dsd003.life`, and Firebase Android config added.

## Completed update log

### Completed foundation updates

- Update 1: Android-first Material 3 app shell, bottom navigation, reusable cards, section headers, empty states, and coming-soon badges.
- Update 2: local-first models and repository interfaces with seeded in-memory data, prepared for a future SQLite/Isar/Hive storage adapter and Firebase sync adapter.
- Update 3: Daily Planner, Tasks, Goals, and Habits MVP with create, edit, and complete flows where practical.
- Update 4: personal INR finance MVP with Bank/UPI account source, income, expenses, pending bills, cash flow, monthly summary, basic reports, and advanced finance marked coming soon.
- Update 5: Prayer module with five daily prayers, completion tracking, progress summary, and placeholders for calculation settings, reminders, Quran, dhikr, dua, Ramadan, and charity.
- Update 6: Health dashboard with priority manual metrics and a permission-first Health Connect / Google Fit boundary.
- Update 7: daily closing reports, weekly reviews, monthly reviews, and offline rule-based local suggestions.
- Update 8: schema-versioned local repository persistence boundary with JSON serialization and timestamps for all enabled model families.
- Update 9: Firebase Android/auth foundation UI with optional Google login state and signed-out local-first default.
- Update 10: sync adapter boundary with local-source-of-truth copy, queued status, conflict strategy, export/import hooks, and privacy controls.
- Update 11: expanded CRUD actions for finance, health, goals, notes, and daily reviews; Business and sensitive modules remain out of the enabled first version.
- Update 12: Android notification permission handling, reminder settings UI, safe off-by-default preferences, and local scheduling logic.
- Update 13: explicit-consent Health Connect / Google Fit integration boundary with denied, unavailable, partial, and connected states.
- App identity: renamed app/package references to Livelife/livelife and aligned Android `applicationId` / namespace with Firebase package `com.dsd003.life`.

## Next implementation roadmap

### Next Update 14: Prayer calculation engine

Goal: calculate prayer times accurately instead of using seed placeholders.

Full prompt:

```text
Build Update 14 for the Flutter Livelife app. Replace placeholder prayer times with a real prayer calculation engine. Support multiple calculation methods, automatic location-based calculation, manual location selection, manual prayer time adjustment, Hanafi/Shafi'i Asr options, timezone/daylight handling, and a settings screen where the user can change the method at any time. Keep all labels English. Add tests for calculation settings, manual adjustments, and prayer progress display.
```

### Next Update 15: Branding, launcher icon, and splash screen

Goal: finalize app identity after logo assets are provided.

Full prompt after logo files are available:

```text
Build Update 15 for the Flutter Livelife app. Add the final custom logo assets into the assets folder using docs/LOGO_ASSETS.md. Configure Android launcher icons, adaptive icon foreground/background, splash screen, and app display name. Ensure the logo works in light mode and dark mode and does not contain text inside the icon. Update pubspec/assets configuration if needed and add tests or checks for asset paths.
```

## What is still needed from the owner

No blocking owner decision is needed for the next prayer calculation update. Before branding can be completed, the owner should provide:

- Final logo image files matching the required asset specification.
- Exact visual logo design approval before launcher icon and splash screen generation.
