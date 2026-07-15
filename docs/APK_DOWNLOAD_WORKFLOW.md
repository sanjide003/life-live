# APK Download Workflow

The release APK workflow is `.github/workflows/build.yml` and is named **Build Release APK**.

## How to download APKs from GitHub Actions

1. Open the repository on GitHub.
2. Go to **Actions**.
3. Select **Build Release APK**.
4. Run it manually with **Run workflow** or push to `main` / `master`.
5. Open the finished workflow run.
6. Download the artifact named **Livelife-Release-APKs**.

The artifact contains split APKs:

- `Livelife-arm64-v8a.apk` for most modern Android phones.
- `Livelife-armeabi-v7a.apk` for older 32-bit ARM devices.
- `Livelife-x86_64.apk` for emulators / x86_64 devices.

The same APKs are also uploaded to the GitHub Release created by the workflow.

## Why desugaring is enabled

`flutter_local_notifications` requires Android core library desugaring. The app enables `isCoreLibraryDesugaringEnabled = true` and adds `com.android.tools:desugar_jdk_libs` in `android/app/build.gradle.kts`.

## Android minimum SDK

The `health` plugin requires Android SDK 26 or newer, so the release build sets `minSdk = maxOf(26, flutter.minSdkVersion)` in `android/app/build.gradle.kts`. This avoids manifest merger failures during `flutter build apk --release --split-per-abi`.

## CI formatting behavior

The CI workflow runs `dart format --set-exit-if-changed lib test integration_test` before analysis/tests. If this step fails, run the same command locally after applying `dart format lib test integration_test`, commit the formatted files, and rerun CI.
