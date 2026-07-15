part of 'life_os_shell.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key, required this.authState, required this.privacySettings, required this.reminderSettings, required this.prayerSettings});

  final AuthState authState;
  final PrivacySettings privacySettings;
  final ReminderSettings reminderSettings;
  final PrayerCalculationSettings prayerSettings;

  @override
  Widget build(BuildContext context) {
    final settings = AppSettingsState(theme: ThemePreference.system, authState: authState, privacySettings: privacySettings, reminderSettings: reminderSettings, prayerSettings: prayerSettings);
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SectionHeader(title: 'Profile and privacy'),
          FeatureTile(title: settings.authState.label, description: 'Optional Google login keeps local-first access available.', icon: Icons.account_circle),
          FeatureTile(title: 'Firebase backup', description: settings.privacySettings.firebaseBackupEnabled ? 'Backup is enabled' : 'Backup is off until you opt in', icon: Icons.cloud_sync),
          FeatureTile(title: 'Export / Import', description: 'Create or restore local backup files safely.', icon: Icons.import_export),
          const SectionHeader(title: 'Preferences'),
          FeatureTile(title: 'Notification preferences', description: settings.reminderSettings.permissionLabel, icon: Icons.notifications_active),
          FeatureTile(title: 'Prayer calculation settings', description: '${settings.prayerSettings.methodLabel} • ${settings.prayerSettings.asrLabel}', icon: Icons.mosque),
          FeatureTile(title: 'Theme mode', description: 'System', icon: Icons.dark_mode),
          const SectionHeader(title: 'Permissions'),
          const FeatureTile(title: 'Health Connect permissions', description: 'Connect from the Health tab when you are ready.', icon: Icons.favorite),
          const SectionHeader(title: 'About'),
          FeatureTile(title: 'App version', description: settings.appVersion, icon: Icons.info_outline),
          FeatureTile(title: 'Reset local data', description: 'Requires confirmation before deleting anything.', icon: Icons.delete_forever, action: OutlinedButton(onPressed: () => showDialog<void>(context: context, builder: (context) => AlertDialog(title: const Text('Reset local data?'), content: const Text('This action requires confirmation and is not performed from this preview.'), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel'))])), child: const Text('Review'))),
        ],
      ),
    );
  }
}
