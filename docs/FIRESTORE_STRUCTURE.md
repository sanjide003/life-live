# Livelife Firestore Structure

Livelife is local-first. Firestore is used only when the user signs in and explicitly enables Firebase backup.

## Collections

```text
users/{uid}
users/{uid}/records/{recordId}
users/{uid}/snapshots/current
users/{uid}/metadata/sync
users/{uid}/deletionRequests/{requestId}
```

## Record shape

```json
{
  "type": "task | habit | goal | finance | health | prayer | note | review | settings",
  "payload": {},
  "updatedAt": "server timestamp",
  "deleted": false
}
```

## Access control

Users may only read and write documents under their own `users/{uid}` path. The Firestore rules enforce `request.auth.uid == userId` for all nested documents.

## Backup disable flow

1. User turns off Firebase backup.
2. App stops queueing uploads immediately.
3. Local SQLite data remains intact.
4. Remote records can be deleted only after explicit confirmation.

## Data deletion flow

1. User opens Settings > Reset local data or Privacy > Delete cloud backup.
2. App shows a confirmation dialog.
3. Local data deletion clears the SQLite store after confirmation.
4. Cloud backup deletion removes `users/{uid}` documents after re-authentication where required.
