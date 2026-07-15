import '../prayer_calculations.dart';
import '../reminder_services.dart';
import '../sync_services.dart';

enum ThemePreference { system, light, dark }

class AppSettingsState {
  const AppSettingsState({required this.theme, required this.authState, required this.privacySettings, required this.reminderSettings, required this.prayerSettings, this.appVersion = '1.0.0'});
  final ThemePreference theme;
  final AuthState authState;
  final PrivacySettings privacySettings;
  final ReminderSettings reminderSettings;
  final PrayerCalculationSettings prayerSettings;
  final String appVersion;

  AppSettingsState copyWith({ThemePreference? theme, AuthState? authState, PrivacySettings? privacySettings, ReminderSettings? reminderSettings, PrayerCalculationSettings? prayerSettings}) => AppSettingsState(theme: theme ?? this.theme, authState: authState ?? this.authState, privacySettings: privacySettings ?? this.privacySettings, reminderSettings: reminderSettings ?? this.reminderSettings, prayerSettings: prayerSettings ?? this.prayerSettings, appVersion: appVersion);
}
