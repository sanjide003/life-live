enum ReminderPermissionStatus { unknown, denied, granted }

enum ReminderTargetType { task, habit, prayer, bill, dailyClosingReport }

class ReminderPreference {
  const ReminderPreference({
    required this.id,
    required this.targetType,
    required this.title,
    required this.enabled,
    required this.timeLabel,
  });

  final String id;
  final ReminderTargetType targetType;
  final String title;
  final bool enabled;
  final String timeLabel;

  ReminderPreference copyWith({bool? enabled, String? timeLabel}) => ReminderPreference(
        id: id,
        targetType: targetType,
        title: title,
        enabled: enabled ?? this.enabled,
        timeLabel: timeLabel ?? this.timeLabel,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'targetType': targetType.name,
        'title': title,
        'enabled': enabled,
        'timeLabel': timeLabel,
      };

  factory ReminderPreference.fromJson(Map<String, Object?> json) => ReminderPreference(
        id: json['id'] as String,
        targetType: ReminderTargetType.values.byName(json['targetType'] as String),
        title: json['title'] as String,
        enabled: json['enabled'] as bool,
        timeLabel: json['timeLabel'] as String,
      );
}

class ReminderSettings {
  const ReminderSettings({required this.permissionStatus, required this.preferences});

  final ReminderPermissionStatus permissionStatus;
  final List<ReminderPreference> preferences;

  bool get canSchedule => permissionStatus == ReminderPermissionStatus.granted;
  int get enabledCount => preferences.where((preference) => preference.enabled && canSchedule).length;
  String get permissionLabel {
    switch (permissionStatus) {
      case ReminderPermissionStatus.unknown:
        return 'Notification permission not requested';
      case ReminderPermissionStatus.denied:
        return 'Notifications disabled';
      case ReminderPermissionStatus.granted:
        return 'Notifications allowed';
    }
  }

  ReminderSettings copyWith({ReminderPermissionStatus? permissionStatus, List<ReminderPreference>? preferences}) => ReminderSettings(
        permissionStatus: permissionStatus ?? this.permissionStatus,
        preferences: preferences ?? this.preferences,
      );
}

class ReminderScheduler {
  const ReminderScheduler();

  ReminderSettings defaultSettings() => const ReminderSettings(
        permissionStatus: ReminderPermissionStatus.unknown,
        preferences: [
          ReminderPreference(id: 'daily-closing', targetType: ReminderTargetType.dailyClosingReport, title: 'Daily closing report', enabled: false, timeLabel: '9:30 PM'),
          ReminderPreference(id: 'task-review', targetType: ReminderTargetType.task, title: 'Planner review', enabled: false, timeLabel: '8:30 PM'),
          ReminderPreference(id: 'habit-water', targetType: ReminderTargetType.habit, title: 'Habit reminders', enabled: false, timeLabel: 'Every 2 hours'),
          ReminderPreference(id: 'prayer-all', targetType: ReminderTargetType.prayer, title: 'Prayer reminders', enabled: false, timeLabel: 'Before each prayer'),
          ReminderPreference(id: 'bill-due', targetType: ReminderTargetType.bill, title: 'Bill reminders', enabled: false, timeLabel: '1 day before due'),
        ],
      );

  ReminderSettings requestAndroidPermission(ReminderSettings settings, {required bool userGranted}) => settings.copyWith(
        permissionStatus: userGranted ? ReminderPermissionStatus.granted : ReminderPermissionStatus.denied,
        preferences: userGranted ? settings.preferences : settings.preferences.map((preference) => preference.copyWith(enabled: false)).toList(),
      );

  ReminderSettings setPreferenceEnabled(ReminderSettings settings, String id, bool enabled) {
    final safeEnabled = settings.canSchedule && enabled;
    return settings.copyWith(
      preferences: [
        for (final preference in settings.preferences)
          if (preference.id == id) preference.copyWith(enabled: safeEnabled) else preference,
      ],
    );
  }

  List<ReminderPreference> scheduledPreferences(ReminderSettings settings) {
    if (!settings.canSchedule) {
      return const [];
    }
    return settings.preferences.where((preference) => preference.enabled).toList();
  }
}
