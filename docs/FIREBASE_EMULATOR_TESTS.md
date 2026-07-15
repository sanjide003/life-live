# Firebase Emulator Test Plan

Run these checks before public beta:

```bash
firebase emulators:start --only auth,firestore
flutter test test/firestore_rules_test.dart
flutter test integration_test
```

Required rule cases:

- Authenticated user can read/write `users/{uid}`.
- Authenticated user cannot read/write another user's documents.
- Unauthenticated users cannot read or write any user document.
- Backup deletion is allowed only under the signed-in user's path.
