import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('CI workflow runs Flutter checks and binary diff guard', () {
    final workflow = File('.github/workflows/flutter_ci.yml').readAsStringSync();

    expect(workflow, contains('flutter pub get'));
    expect(workflow, contains('dart format --set-exit-if-changed'));
    expect(workflow, contains('flutter analyze'));
    expect(workflow, contains('flutter test'));
    expect(workflow, contains('Generated binary assets must not be committed'));
  });
}
