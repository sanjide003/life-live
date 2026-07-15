# Android Release Checklist

## Versioning

- Update `pubspec.yaml` `version:` before every release.
- Use semantic app version plus monotonically increasing build number.

## Signing

- Keep upload keystore outside git.
- Configure signing through `android/key.properties` or CI secrets.
- Never commit keystore files or passwords.

## Build checks

```bash
flutter pub get
dart format --set-exit-if-changed lib test integration_test
flutter analyze
flutter test
flutter test integration_test
flutter build appbundle --release
```

## ProGuard / R8

- Keep minification disabled until plugin rules are verified.
- Add keep rules only for plugins that require reflection.

## Launcher and splash

- Verify `assets/app_logo.svg` has no text inside the icon.
- Run `python3 tool/generate_logo_assets.py` before store packaging.
- Verify adaptive icon foreground/background and dark splash are present.

## Permissions audit

- Notifications: requested only when enabling reminders.
- Activity/health permissions: requested only from the Health tab.
- No SMS, contacts, password vault, ID document, or location-history permissions in first release.

## Privacy disclosures

- Include the privacy policy draft.
- Disclose optional Firebase backup and Health Connect usage.
