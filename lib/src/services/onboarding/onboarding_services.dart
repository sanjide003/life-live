class OnboardingStepInfo {
  const OnboardingStepInfo({required this.title, required this.description});
  final String title;
  final String description;
}

class OnboardingState {
  const OnboardingState({required this.completed, required this.currentIndex});
  final bool completed;
  final int currentIndex;
  OnboardingState next(int totalSteps) => currentIndex >= totalSteps - 1 ? const OnboardingState(completed: true, currentIndex: 0) : OnboardingState(completed: false, currentIndex: currentIndex + 1);
  OnboardingState skip() => const OnboardingState(completed: true, currentIndex: 0);
}

const onboardingSteps = [
  OnboardingStepInfo(title: 'Local-first privacy', description: 'Your data starts on this device.'),
  OnboardingStepInfo(title: 'Optional Google login', description: 'Sign in only when you want Firebase backup.'),
  OnboardingStepInfo(title: 'Notifications', description: 'Reminders stay off until you allow notification permission.'),
  OnboardingStepInfo(title: 'Health Connect', description: 'Health permissions are requested only when you tap Connect.'),
  OnboardingStepInfo(title: 'Prayer settings', description: 'Choose automatic or manual location for prayer times.'),
];
