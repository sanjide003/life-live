# Livelife App Stabilization Audit Prompt

Use this prompt for the next stabilization pass before adding any new product features.

## Current build risks already identified

1. `flutter_local_notifications` requires Android core library desugaring. Keep `isCoreLibraryDesugaringEnabled = true` and `com.android.tools:desugar_jdk_libs` in `android/app/build.gradle.kts`.
2. The `health` plugin requires Android SDK 26 or newer. Keep `minSdk = maxOf(26, flutter.minSdkVersion)` unless the health plugin is removed or replaced with a lower-min-SDK implementation.
3. CI must fail on unformatted Dart. Keep `dart format --set-exit-if-changed lib test integration_test` in `.github/workflows/flutter_ci.yml` and commit formatter output before requesting review.
4. Generated binary logo assets can break review systems. Keep generated PNG/ICO files out of PR diffs unless the repository owner explicitly allows binary diffs.
5. Release APK download is provided by `.github/workflows/build.yml` through the `Livelife-Release-APKs` artifact and GitHub Release attachments.

## Required stabilization prompt

```text
You are working on the Flutter Livelife app. Do not add new features. Your only goal is to make the current app build, analyze, test, and release reliably.

1. Inspect the repository status and do not overwrite user changes.
2. Run and fix, in this exact order:
   - flutter pub get
   - dart format --set-exit-if-changed lib test integration_test
   - flutter analyze
   - flutter test
   - flutter test integration_test
   - flutter build apk --release --split-per-abi
3. If `dart format --set-exit-if-changed` fails, run `dart format lib test integration_test`, review the diff, and commit the formatting changes.
4. Fix every compile, analyzer, lint, test, Gradle, manifest, dependency, plugin API, and integration-test failure surfaced by the commands.
5. Verify Android release requirements:
   - core library desugaring remains enabled for notifications
   - minSdk remains at least 26 for the health plugin
   - app label is `Livelife`
   - package/application ID is correct for the intended Play Console app
   - no generated PNG/ICO logo files are introduced in the PR diff
   - split APKs are produced under `build/app/outputs/flutter-apk/`
6. Verify GitHub workflows:
   - Flutter CI runs pub get, format check, analyze, unit/widget tests, integration tests, dependency audit, and binary asset guard
   - Build Release APK uploads `Livelife-Release-APKs`
7. Update only documentation that is directly wrong or stale because of the fixes.
8. Provide a final report listing every command run, every failure found, every fix applied, and where the APK artifacts can be downloaded.
```

## Definition of done

- `flutter analyze` has zero errors.
- `flutter test` passes.
- `flutter test integration_test` passes or has a documented environment-only reason and a separate CI job that validates it.
- `flutter build apk --release --split-per-abi` completes successfully.
- The PR diff does not include generated binary logo assets.
- APK artifacts are downloadable from the `Livelife-Release-APKs` GitHub Actions artifact.
