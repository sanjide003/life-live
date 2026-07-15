part of 'life_os_shell.dart';

class FinanceScreen extends StatelessWidget {
  const FinanceScreen({super.key, required this.entries, required this.onAddEntry, required this.onUpdateEntry, required this.onDeleteEntry});

  final List<FinanceEntry> entries;
  final ValueChanged<FinanceEntry> onAddEntry;
  final ValueChanged<FinanceEntry> onUpdateEntry;
  final ValueChanged<String> onDeleteEntry;

  @override
  Widget build(BuildContext context) {
    final summary = calculateFinanceSummary(entries);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const SectionHeader(title: 'Finance', action: 'INR • Bank / UPI'), FilledButton.icon(onPressed: () => showFinanceEditor(context: context, onSave: onAddEntry), icon: const Icon(Icons.add), label: const Text('Add Entry'))]),
        const SizedBox(height: 8),
        GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, childAspectRatio: 1.65, crossAxisSpacing: 12, mainAxisSpacing: 12, children: [
          MetricCard(label: 'Income', value: '₹${summary.incomeInr.toStringAsFixed(0)}', icon: Icons.south_west, color: const Color(0xFF16A34A)),
          MetricCard(label: 'Expense', value: '₹${summary.expenseInr.toStringAsFixed(0)}', icon: Icons.north_east, color: const Color(0xFFDC2626)),
          MetricCard(label: 'Pending Bills', value: '₹${summary.pendingBillsInr.toStringAsFixed(0)}', icon: Icons.receipt_long, color: const Color(0xFFF97316)),
          MetricCard(label: 'Cash Flow', value: '₹${summary.cashFlowInr.toStringAsFixed(0)}', icon: Icons.account_balance_wallet, color: const Color(0xFF2563EB)),
        ]),
        const SizedBox(height: 20),
        const SectionHeader(title: 'Basic reports', action: 'This month'),
        for (final entry in entries) Card(child: ListTile(leading: Icon(_financeIcon(entry.type)), title: Text(entry.title), subtitle: Text('${financeTypeLabel(entry.type)} • ${entry.accountLabel}${entry.type == FinanceType.bill && entry.paid ? ' • Paid' : ''}'), trailing: Wrap(crossAxisAlignment: WrapCrossAlignment.center, children: [Text('₹${entry.amountInr.toStringAsFixed(0)}'), if (entry.type == FinanceType.bill && !entry.paid) IconButton(tooltip: 'Mark paid', icon: const Icon(Icons.done_all), onPressed: () => onUpdateEntry(entry.copyWith(paid: true))), IconButton(tooltip: 'Delete finance entry', icon: const Icon(Icons.delete_outline), onPressed: () => onDeleteEntry(entry.id))]))),
        const FeatureTile(title: 'Advanced finance', description: 'Categories, budget rules, tax/GST, investments, loans and credit cards are coming soon', icon: Icons.trending_up, comingSoon: true),
      ],
    );
  }
}
