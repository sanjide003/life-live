import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/services/ui/ui_polish_services.dart';

void main() {
  test('theme factory supports light/dark Material 3 and semantic UI state messages', () {
    const factory = LivelifeThemeFactory();

    expect(factory.build(Brightness.light).useMaterial3, isTrue);
    expect(factory.build(Brightness.dark).colorScheme.brightness, Brightness.dark);
    expect(emptyStateMessage.semanticLabel, 'Empty state');
    expect(loadingStateMessage.title, contains('Loading'));
    expect(errorStateMessage.description, contains('local data'));
  });
}
