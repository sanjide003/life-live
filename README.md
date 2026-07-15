# Livelife

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Local developer commands

```bash
flutter pub get
dart format --set-exit-if-changed lib test integration_test
flutter analyze
flutter test
flutter test integration_test
python3 tool/generate_logo_assets.py
flutter build appbundle --release
```

## Release readiness

See `docs/ANDROID_RELEASE_CHECKLIST.md` for Android signing, release checks, permissions audit, launcher/splash verification, CI commands, and generated logo workflow.

## Firebase and privacy

See `docs/FIRESTORE_STRUCTURE.md`, `firebase/firestore/firestore.rules`, and `docs/PRIVACY_POLICY_DRAFT.md` for Firestore structure, access control, backup disable flow, data deletion flow, and privacy disclosures.

## Downloading release APKs

The GitHub Actions workflow **Build Release APK** builds split release APKs and uploads an artifact named `Livelife-Release-APKs`. Open Actions, choose the workflow run, and download `Livelife-arm64-v8a.apk` for most Android phones. See `docs/APK_DOWNLOAD_WORKFLOW.md` for full steps.
