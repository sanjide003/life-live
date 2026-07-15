# Livelife Firebase Sync Plan

Livelife remains offline-first. The local SQLite store is the source of truth and Firebase backup starts only after the user signs in and explicitly enables Firebase backup.

## Collections

```text
users/{uid}/snapshots/current
users/{uid}/metadata/sync
```

The current implementation keeps the sync boundary testable with `FirestoreSyncClient`; production code can replace the in-memory client with a Firestore adapter without changing UI state or local repositories.

## Conflict strategy

- Every local record keeps `updatedAt` metadata.
- Local writes are queued while offline.
- If the remote record is newer than the local record, show a conflict review before destructive overwrite.
- If the local record is newer, upload the local record and keep local-first behavior.

## Draft Firestore security rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Privacy requirements

- No upload when signed out.
- No upload when Firebase backup is disabled.
- Export/import stays available without login.
- Sensitive first-version exclusions remain out of scope: password vault, ID documents, SMS parsing, and location history.
