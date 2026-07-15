import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('beta tester checklist and release docs cover required candidate checks', () {
    final checklist = File('docs/BETA_TESTER_CHECKLIST.md').readAsStringSync();
    final release = File('docs/ANDROID_RELEASE_CHECKLIST.md').readAsStringSync();
    final pubspec = File('pubspec.yaml').readAsStringSync();

    expect(pubspec, contains('version:'));
    expect(checklist, contains('Export backup and preview import'));
    expect(checklist, contains('Disable Firebase backup'));
    expect(release, contains('flutter build appbundle --release'));
    expect(release, contains('Run `python3 tool/generate_logo_assets.py`'));
  });
}
