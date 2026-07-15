import 'package:flutter_test/flutter_test.dart';
import 'package:livelife/src/services/onboarding/onboarding_persistence_services.dart';

void main() {
  test('persists onboarding completion, skip and reset without requesting permissions', () async {
    final controller = OnboardingController(MemoryOnboardingStore());

    expect((await controller.load()).completed, isFalse);
    expect((await controller.skip()).completed, isTrue);
    await controller.reset();
    expect((await controller.load()).completed, isFalse);
    expect((await controller.complete()).completed, isTrue);
  });
}
