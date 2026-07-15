import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('logo assets and Android icon configuration paths exist', () {
    const assetPaths = [
      'assets/app_logo.svg',
      'tool/generate_logo_assets.py',
      'android/app/src/main/res/drawable/app_logo_foreground.xml',
      'android/app/src/main/res/drawable/app_logo_background.xml',
      'android/app/src/main/res/drawable/splash_logo_vector.xml',
      'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
      'android/app/src/main/res/drawable/launch_background.xml',
      'android/app/src/main/res/drawable-night/launch_background.xml',
    ];

    for (final path in assetPaths) {
      expect(File(path).existsSync(), isTrue, reason: '$path should exist');
    }

    final pubspec = File('pubspec.yaml').readAsStringSync();
    expect(pubspec, contains('assets/'));
    expect(pubspec, contains('assets/icon.png'));
    expect(pubspec, contains('adaptive_icon_background: "#0F766E"'));

    final generator = File('tool/generate_logo_assets.py').readAsStringSync();
    expect(generator, contains('app_logo_1024.png'));
    expect(generator, contains('favicon.ico'));

    final manifest = File('android/app/src/main/AndroidManifest.xml').readAsStringSync();
    expect(manifest, contains('android:label="Livelife"'));
    expect(manifest, contains('android:roundIcon="@mipmap/ic_launcher_round"'));
  });
}
