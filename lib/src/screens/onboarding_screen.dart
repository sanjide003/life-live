part of 'life_os_shell.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key, required this.onComplete});

  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Welcome to Livelife')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            for (final step in onboardingSteps) FeatureTile(title: step.title, description: step.description, icon: Icons.check_circle_outline),
            FilledButton(onPressed: onComplete, child: const Text('Start Livelife')),
            TextButton(onPressed: onComplete, child: const Text('Skip for now')),
          ],
        ),
      );
}
