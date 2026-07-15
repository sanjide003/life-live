import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Android manifest contains only first-version approved permission families', () {
    final manifest = File('android/app/src/main/AndroidManifest.xml').readAsStringSync();

    expect(manifest, contains('POST_NOTIFICATIONS'));
    expect(manifest, contains('ACTIVITY_RECOGNITION'));
    expect(manifest, isNot(contains('READ_SMS')));
    expect(manifest, isNot(contains('ACCESS_FINE_LOCATION')));
    expect(manifest, isNot(contains('READ_CONTACTS')));
  });

  test('release signing placeholders and ProGuard documentation exist', () {
    expect(File('android/key.properties.example').existsSync(), isTrue);
    expect(File('android/app/proguard-rules/livelife-rules.pro').readAsStringSync(), contains('plugin-specific keep rules'));
  });
}
