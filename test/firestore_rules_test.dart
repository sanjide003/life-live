import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Firestore rules scope every user document to the signed-in uid', () {
    final rules = File('firebase/firestore/firestore.rules').readAsStringSync();

    expect(rules, contains('match /users/{userId}/{document=**}'));
    expect(rules, contains('request.auth.uid == userId'));
    expect(rules, isNot(contains('allow read, write: if true')));
  });

  test('Firebase emulator and indexes are documented for release checks', () {
    final firebase = File('firebase.json').readAsStringSync();
    final indexes = File('firebase/firestore/firestore.indexes.json').readAsStringSync();

    expect(firebase, contains('"firestore"'));
    expect(firebase, contains('"emulators"'));
    expect(indexes, contains('"collectionGroup": "records"'));
  });
}
