# Update 36 CI Recovery Plan

This environment does not include Flutter or Dart executables, so the compile pass must run in CI or a local Flutter SDK.

Required command sequence:

```bash
flutter pub get
dart format --set-exit-if-changed lib test integration_test
flutter analyze
flutter test
flutter test integration_test
```

Fix order:

1. Resolve `pubspec.yaml` / `pubspec.lock` dependency conflicts.
2. Fix plugin API mismatches for Firebase, Health, notifications, sqlite, and integration_test.
3. Apply formatter output.
4. Fix analyzer warnings and errors.
5. Fix unit/widget/integration failures.
6. Confirm binary logo files are not committed.
