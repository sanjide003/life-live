part of 'life_os_shell.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, required this.tasks, required this.habits, required this.goals, required this.financeEntries, required this.healthEntries, required this.prayerRecords, required this.reviews, required this.onOpenTab});

  final List<LifeTask> tasks;
  final List<Habit> habits;
  final List<Goal> goals;
  final List<FinanceEntry> financeEntries;
  final List<HealthEntry> healthEntries;
  final List<PrayerRecord> prayerRecords;
  final List<DailyReview> reviews;
  final ValueChanged<int> onOpenTab;

  @override
  Widget build(BuildContext context) {
    final completedTasks = tasks.where((task) => task.completed).length;
    final completedHabits = habits.where((habit) => habit.completedToday).length;
    final completedPrayers = prayerRecords.where((prayer) => prayer.completed).length;
    final income = financeEntries.where((entry) => entry.type == FinanceType.income).fold<double>(0, (sum, entry) => sum + entry.amountInr);
    final expense = financeEntries.where((entry) => entry.type == FinanceType.expense).fold<double>(0, (sum, entry) => sum + entry.amountInr);
    final dailyReport = buildDailyClosingReport(tasks: tasks, habits: habits, financeEntries: financeEntries, healthEntries: healthEntries, prayerRecords: prayerRecords);
    final weeklyReview = buildWeeklyReview(tasks: tasks, habits: habits, financeEntries: financeEntries, prayerRecords: prayerRecords);
    final monthlyReview = buildMonthlyReview(goals: goals, financeEntries: financeEntries, habits: habits);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const _HeroCard(),
        const SizedBox(height: 16),
        const _ProductDecisionCard(),
        const SizedBox(height: 16),
        const SectionHeader(title: 'Today at a glance', action: 'Offline summary'),
        const SizedBox(height: 8),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          childAspectRatio: 1.65,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: [
            MetricCard(label: 'Tasks Done', value: '$completedTasks / ${tasks.length}', icon: Icons.check_circle, color: const Color(0xFF16A34A)),
            MetricCard(label: 'Habit Progress', value: '$completedHabits / ${habits.length}', icon: Icons.local_fire_department, color: const Color(0xFFF97316)),
            MetricCard(label: 'Prayer Progress', value: '$completedPrayers / 5', icon: Icons.mosque, color: const Color(0xFF7C3AED)),
            MetricCard(label: 'Balance', value: '₹${(income - expense).toStringAsFixed(0)}', icon: Icons.currency_rupee, color: const Color(0xFF2563EB)),
          ],
        ),
        const SizedBox(height: 20),
        const SectionHeader(title: 'Open your day'),
        FeatureTile(title: 'Daily Planner', description: 'Morning routine, tasks, evening review and tomorrow planning', icon: Icons.today, onTap: () => onOpenTab(1)),
        FeatureTile(title: 'Habits & Goals', description: '${habits.length} habits and ${goals.length} active goals', icon: Icons.track_changes, onTap: () => onOpenTab(2)),
        FeatureTile(title: 'Health Connect Ready', description: '${healthEntries.length} health metrics with manual logs now', icon: Icons.favorite, onTap: () => onOpenTab(4)),
        const SizedBox(height: 20),
        const SectionHeader(title: 'Offline reports'),
        _ReportCard(report: dailyReport),
        _ReportCard(report: weeklyReview),
        _ReportCard(report: monthlyReview),
        const SizedBox(height: 20),
        const SectionHeader(title: 'Local suggestions', action: 'No online AI'),
        for (final suggestion in dailyReport.suggestions) Card(child: ListTile(leading: const CircleAvatar(child: Icon(Icons.lightbulb_outline)), title: Text(suggestion))),
        if (reviews.isNotEmpty) Card(child: ListTile(leading: const CircleAvatar(child: Icon(Icons.auto_awesome)), title: const Text('Offline assistant summary'), subtitle: Text(reviews.first.summary))),
      ],
    );
  }
}

class _ReportCard extends StatelessWidget {
  const _ReportCard({required this.report});
  final LifeReport report;

  @override
  Widget build(BuildContext context) => Card(child: ListTile(leading: const CircleAvatar(child: Icon(Icons.summarize)), title: Text(report.title), subtitle: Text(report.summary)));
}
