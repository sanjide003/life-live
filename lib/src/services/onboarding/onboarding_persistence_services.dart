import 'onboarding_services.dart';

abstract class OnboardingStore {
  Future<OnboardingState?> read();
  Future<void> write(OnboardingState state);
  Future<void> reset();
}

class MemoryOnboardingStore implements OnboardingStore {
  OnboardingState? _state;
  @override
  Future<OnboardingState?> read() async => _state;
  @override
  Future<void> write(OnboardingState state) async => _state = state;
  @override
  Future<void> reset() async => _state = null;
}

class OnboardingController {
  OnboardingController(this.store);
  final OnboardingStore store;

  Future<OnboardingState> load() async => await store.read() ?? const OnboardingState(completed: false, currentIndex: 0);
  Future<OnboardingState> skip() async {
    final state = const OnboardingState(completed: false, currentIndex: 0).skip();
    await store.write(state);
    return state;
  }

  Future<OnboardingState> complete() async {
    const state = OnboardingState(completed: true, currentIndex: 0);
    await store.write(state);
    return state;
  }

  Future<void> reset() => store.reset();
}
