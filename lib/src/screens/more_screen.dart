part of 'life_os_shell.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key, required this.prayerRecords, required this.prayerSettings, required this.onTogglePrayer, required this.onPrayerSettingsChanged, required this.notes, required this.reviews, required this.authState, required this.syncState, required this.privacySettings, required this.reminderSettings, required this.onGrantNotifications, required this.onDenyNotifications, required this.onToggleReminder, required this.onToggleSignIn, required this.onToggleBackup, required this.onAddNote, required this.onDeleteNote, required this.onAddReview, required this.onDeleteReview});

  final List<PrayerRecord> prayerRecords;
  final PrayerCalculationSettings prayerSettings;
  final void Function(PrayerRecord prayer, bool? completed) onTogglePrayer;
  final ValueChanged<PrayerCalculationSettings> onPrayerSettingsChanged;
  final List<LifeNote> notes;
  final List<DailyReview> reviews;
  final AuthState authState;
  final SyncState syncState;
  final PrivacySettings privacySettings;
  final ReminderSettings reminderSettings;
  final VoidCallback onGrantNotifications;
  final VoidCallback onDenyNotifications;
  final void Function(String id, bool enabled) onToggleReminder;
  final VoidCallback onToggleSignIn;
  final ValueChanged<bool> onToggleBackup;
  final ValueChanged<LifeNote> onAddNote;
  final ValueChanged<String> onDeleteNote;
  final ValueChanged<DailyReview> onAddReview;
  final ValueChanged<String> onDeleteReview;

  @override
  Widget build(BuildContext context) {
    final progress = calculatePrayerProgress(prayerRecords);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionHeader(title: 'Prayer', action: '${progress.label} prayers'),
        const SizedBox(height: 8),
        LinearProgressIndicator(value: progress.ratio),
        const SizedBox(height: 12),
        for (final prayer in prayerRecords) Card(child: CheckboxListTile(value: prayer.completed, onChanged: (value) => onTogglePrayer(prayer, value), title: Text(prayer.name), subtitle: Text(prayer.timeLabel), secondary: const Icon(Icons.mosque))),
        const SectionHeader(title: 'Prayer settings'),
        PrayerSettingsCard(settings: prayerSettings, onChanged: onPrayerSettingsChanged),
        const FeatureTile(title: 'Reminder settings', description: 'Per-prayer reminders and quiet-time controls', icon: Icons.notifications_active, comingSoon: true),
        const FeatureTile(title: 'Quran tracking', description: 'Pages, verses and sessions', icon: Icons.menu_book, comingSoon: true),
        const FeatureTile(title: 'Dhikr and dua', description: 'Daily counters and saved duas', icon: Icons.favorite, comingSoon: true),
        const FeatureTile(title: 'Ramadan and charity', description: 'Fasting, charity and Ramadan goals', icon: Icons.volunteer_activism, comingSoon: true),
        const SizedBox(height: 20),
        SectionHeader(title: 'Reminders', action: reminderSettings.permissionLabel),
        FeatureTile(
          title: 'Android notification permission',
          description: 'Reminders stay disabled until you allow notifications. Safe default: off.',
          icon: Icons.notifications_active,
          action: Wrap(spacing: 4, children: [
            FilledButton(onPressed: onGrantNotifications, child: const Text('Allow')),
            TextButton(onPressed: onDenyNotifications, child: const Text('Deny')),
          ]),
        ),
        for (final reminder in reminderSettings.preferences)
          SwitchListTile(
            value: reminder.enabled && reminderSettings.canSchedule,
            onChanged: reminderSettings.canSchedule ? (value) => onToggleReminder(reminder.id, value) : null,
            title: Text(reminder.title),
            subtitle: Text(reminder.timeLabel),
          ),
        const SizedBox(height: 20),
        const SectionHeader(title: 'Backup and privacy'),
        FeatureTile(title: 'Settings', description: 'Profile, backup, notifications, prayer, theme, privacy and reset controls', icon: Icons.settings, onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => SettingsScreen(authState: authState, privacySettings: privacySettings, reminderSettings: reminderSettings, prayerSettings: prayerSettings)))),
        FeatureTile(title: authState.label, description: 'Google login is optional. Livelife works without login and keeps local data first.', icon: Icons.account_circle, action: FilledButton(onPressed: onToggleSignIn, child: Text(authState.isSignedIn ? 'Sign Out' : 'Optional Google Login'))),
        SwitchListTile(value: privacySettings.firebaseBackupEnabled, onChanged: authState.isSignedIn ? onToggleBackup : null, title: const Text('Firebase backup opt-in'), subtitle: Text(syncState.label)),
        FeatureTile(title: 'Export / Import', description: 'Manual local backup files are prepared for privacy-first recovery', icon: Icons.import_export),
        FeatureTile(title: 'Conflict handling', description: syncState.conflictMessage ?? 'Local data wins until the user reviews a cloud conflict', icon: Icons.compare_arrows),
        const SizedBox(height: 20),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const SectionHeader(title: 'Notes and reviews'), OutlinedButton.icon(onPressed: () => showNoteEditor(context: context, onSave: onAddNote), icon: const Icon(Icons.add), label: const Text('Add Note'))]),
        for (final note in notes) FeatureTile(title: note.title, description: note.body, icon: Icons.edit_note, action: IconButton(tooltip: 'Delete note', icon: const Icon(Icons.delete_outline), onPressed: () => onDeleteNote(note.id))),
        OutlinedButton.icon(onPressed: () => showReviewEditor(context: context, onSave: onAddReview), icon: const Icon(Icons.rate_review), label: const Text('Add Daily Review')),
        for (final review in reviews) FeatureTile(title: 'Daily Review', description: review.tomorrowPlan, icon: Icons.rate_review, action: IconButton(tooltip: 'Delete review', icon: const Icon(Icons.delete_outline), onPressed: () => onDeleteReview(review.id))),
      ],
    );
  }
}
