import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:livelife/src/app.dart';
import 'package:livelife/src/data/life_repository.dart';

void main() {
  testWidgets('Life OS shell renders dashboard and bottom navigation', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    expect(find.text('Livelife'), findsOneWidget);
    expect(find.text('Personal Life Operating System'), findsOneWidget);
    expect(find.text('Locked product direction'), findsOneWidget);
    expect(find.text('Offline-first + Firebase sync'), findsOneWidget);
    expect(find.text('Dashboard'), findsOneWidget);
    expect(find.text('Planner'), findsOneWidget);
    expect(find.text('Habits'), findsOneWidget);
    expect(find.text('Finance'), findsOneWidget);
    expect(find.text('Health'), findsOneWidget);
    expect(find.text('More'), findsOneWidget);
  });

  testWidgets('Planner supports adding and completing a task', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('Planner'));
    await tester.pumpAndSettle();

    expect(find.text('Daily Planner'), findsOneWidget);

    await tester.tap(find.text('Add Task'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'Call doctor');
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(find.text('Call doctor'), findsOneWidget);

    final taskTile = find.ancestor(
      of: find.text('Call doctor'),
      matching: find.byType(CheckboxListTile),
    );
    await tester.tap(taskTile);
    await tester.pumpAndSettle();

    final checkbox = tester.widget<CheckboxListTile>(taskTile);
    expect(checkbox.value, isTrue);
  });

  testWidgets('Habits tab renders goals and habit controls', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('Habits'));
    await tester.pumpAndSettle();

    expect(find.text('Habits'), findsWidgets);
    expect(find.text('Goals'), findsOneWidget);
    expect(find.text('Add Habit'), findsOneWidget);
    expect(find.text('Build a consistent health routine'), findsOneWidget);
  });

  testWidgets('Finance tab renders INR summary and coming soon finance scope', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('Finance'));
    await tester.pumpAndSettle();

    expect(find.text('INR • Bank / UPI'), findsOneWidget);
    expect(find.text('Income'), findsOneWidget);
    expect(find.text('Expense'), findsOneWidget);
    expect(find.text('Pending Bills'), findsOneWidget);
    expect(find.text('Cash Flow'), findsOneWidget);
    expect(find.text('Basic reports'), findsOneWidget);
    expect(find.text('Advanced finance'), findsOneWidget);
    expect(find.text('Categories, budget rules, tax/GST, investments, loans and credit cards are coming soon'), findsOneWidget);
  });


  testWidgets('More tab renders prayer progress and practice placeholders', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();

    expect(find.text('Prayer'), findsOneWidget);
    expect(find.text('2 / 5 prayers'), findsOneWidget);
    expect(find.text('Fajr'), findsOneWidget);
    expect(find.text('Dhuhr'), findsOneWidget);
    expect(find.text('Asr'), findsOneWidget);
    expect(find.text('Maghrib'), findsOneWidget);
    expect(find.text('Isha'), findsOneWidget);
    expect(find.text('Prayer calculation settings'), findsOneWidget);
    expect(find.text('Reminder settings'), findsOneWidget);
    expect(find.text('Quran tracking'), findsOneWidget);
    expect(find.text('Dhikr and dua'), findsOneWidget);
    expect(find.text('Ramadan and charity'), findsOneWidget);
  });


  testWidgets('Health tab renders permission boundary and priority metrics', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('Health'));
    await tester.pumpAndSettle();

    expect(find.text('Manual + Health Connect'), findsOneWidget);
    expect(find.text('Permission required before sync'), findsOneWidget);
    expect(find.text('No background tracking starts until you explicitly connect Android Health Connect / Google Fit'), findsOneWidget);
    expect(find.text('Steps'), findsWidgets);
    expect(find.text('Sleep'), findsOneWidget);
    expect(find.text('Water'), findsOneWidget);
    expect(find.text('Exercise'), findsOneWidget);
    expect(find.text('Primary manual logs'), findsOneWidget);
    expect(find.text('Medicine Tracking'), findsOneWidget);
    expect(find.text('Secondary metrics'), findsOneWidget);
    expect(find.text('Heart Rate'), findsOneWidget);
    expect(find.text('Blood Pressure'), findsOneWidget);
    expect(find.text('Blood Sugar'), findsOneWidget);
    expect(find.text('Calories, distance, active minutes and BMI'), findsOneWidget);
  });


  testWidgets('Dashboard renders offline reports and local suggestions', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    expect(find.text('Offline reports'), findsOneWidget);
    expect(find.text('Daily closing report'), findsOneWidget);
    expect(find.text('Weekly review'), findsOneWidget);
    expect(find.text('Monthly review'), findsOneWidget);
    expect(find.text('Local suggestions'), findsOneWidget);
    expect(find.text('No online AI'), findsOneWidget);
  });


  testWidgets('More tab shows optional Google login and local-first sync status', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();

    expect(find.text('Backup and privacy'), findsOneWidget);
    expect(find.text('Signed out • Local-first mode'), findsOneWidget);
    expect(find.text('Optional Google Login'), findsOneWidget);
    expect(find.text('Firebase backup opt-in'), findsOneWidget);
    expect(find.text('Local-only backup is active'), findsOneWidget);
  });


  testWidgets('More tab keeps reminders off until notification permission is granted', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();

    expect(find.text('Reminders'), findsOneWidget);
    expect(find.text('Notification permission not requested'), findsOneWidget);
    expect(find.text('Android notification permission'), findsOneWidget);
    expect(find.text('Daily closing report'), findsOneWidget);
  });

  testWidgets('Health tab explains consent before Health Connect sync', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('Health'));
    await tester.pumpAndSettle();

    expect(find.text('Not connected'), findsOneWidget);
    expect(find.text('Consent boundary'), findsOneWidget);
    expect(find.text('Connect'), findsOneWidget);
    expect(find.text('Steps'), findsWidgets);
  });


  testWidgets('all bottom navigation tabs render smoke screens', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    const expectations = <String, String>{
    'Dashboard': 'Today at a glance',
    'Planner': 'Daily Planner',
    'Habits': 'Habits',
    'Finance': 'Finance',
    'Health': 'Health',
    'More': 'Prayer',
  };

    for (final entry in expectations.entries) {
      await tester.tap(find.text(entry.key));
      await tester.pumpAndSettle();
      expect(find.text(entry.value), findsWidgets);
    }
  });


  testWidgets('More tab opens dedicated settings screen', (WidgetTester tester) async {
    await tester.pumpWidget(LifeOsApp(repository: LocalLifeRepository.seeded()));

    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Settings'));
    await tester.pumpAndSettle();

    expect(find.text('Profile and privacy'), findsOneWidget);
    expect(find.text('Theme mode'), findsOneWidget);
    expect(find.text('Health Connect permissions'), findsOneWidget);
    expect(find.text('Reset local data'), findsOneWidget);
  });

}