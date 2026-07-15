part of '../../screens/life_os_shell.dart';

class _HeroCard extends StatelessWidget {
  const _HeroCard();

  @override
  Widget build(BuildContext context) => Card(
        color: Theme.of(context).colorScheme.primary,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Personal Life Operating System', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Android-first, offline-first command center with Firebase sync, Health Connect, prayer tracking and offline summaries.', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.white70)),
          ]),
        ),
      );
}

class _ProductDecisionCard extends StatelessWidget {
  const _ProductDecisionCard();

  @override
  Widget build(BuildContext context) {
    const decisions = ['English only', 'Android first', 'Offline-first + Firebase sync', 'No login first; Google login optional', 'Offline summaries first', 'Custom logo assets required'];
    return Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const SectionHeader(title: 'Locked product direction'), const SizedBox(height: 12), Wrap(spacing: 8, runSpacing: 8, children: [for (final decision in decisions) Chip(avatar: const Icon(Icons.check, size: 16), label: Text(decision))])])));
  }
}
