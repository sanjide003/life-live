import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:livelife/src/app.dart';
import 'package:livelife/src/data/life_repository.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('core local-first navigation and creation smoke flow', (tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    for (final tab in ['Dashboard', 'Planner', 'Habits', 'Finance', 'Health', 'More']) {
      await tester.tap(find.text(tab));
      await tester.pumpAndSettle();
      expect(find.text(tab), findsWidgets);
    }

    await tester.tap(find.text('Planner'));
    await tester.pumpAndSettle();
    expect(find.text('Add Task'), findsOneWidget);

    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();
    expect(find.text('Export / Import'), findsOneWidget);
    expect(find.text('Add Note'), findsOneWidget);
    expect(find.text('Add Daily Review'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
    expect(find.text('Firebase backup opt-in'), findsOneWidget);
  });
}
