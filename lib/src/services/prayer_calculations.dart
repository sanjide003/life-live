import 'dart:math' as math;

import '../models/life_models.dart';

class PrayerProgress {
  const PrayerProgress({required this.completed, required this.total});

  final int completed;
  final int total;

  double get ratio => total == 0 ? 0 : completed / total;
  String get label => '$completed / $total';
}

PrayerProgress calculatePrayerProgress(List<PrayerRecord> prayers) {
  return PrayerProgress(
    completed: prayers.where((prayer) => prayer.completed).length,
    total: prayers.length,
  );
}

enum PrayerCalculationMethod { muslimWorldLeague, egyptian, karachi, ummAlQura, northAmerica }
enum AsrJuristicMethod { shafii, hanafi }
enum PrayerLocationMode { automatic, manual }

class PrayerLocation {
  const PrayerLocation({required this.label, required this.latitude, required this.longitude, required this.timeZoneOffset});

  final String label;
  final double latitude;
  final double longitude;
  final Duration timeZoneOffset;
}

class PrayerCalculationSettings {
  const PrayerCalculationSettings({
    required this.method,
    required this.asrJuristicMethod,
    required this.locationMode,
    required this.location,
    this.manualAdjustments = const {},
  });

  factory PrayerCalculationSettings.defaults({DateTime? now}) => PrayerCalculationSettings(
        method: PrayerCalculationMethod.muslimWorldLeague,
        asrJuristicMethod: AsrJuristicMethod.shafii,
        locationMode: PrayerLocationMode.automatic,
        location: PrayerLocation(
          label: 'Automatic location',
          latitude: 40.7128,
          longitude: -74.0060,
          timeZoneOffset: (now ?? DateTime.now()).timeZoneOffset,
        ),
      );

  final PrayerCalculationMethod method;
  final AsrJuristicMethod asrJuristicMethod;
  final PrayerLocationMode locationMode;
  final PrayerLocation location;
  final Map<String, int> manualAdjustments;

  PrayerCalculationSettings copyWith({
    PrayerCalculationMethod? method,
    AsrJuristicMethod? asrJuristicMethod,
    PrayerLocationMode? locationMode,
    PrayerLocation? location,
    Map<String, int>? manualAdjustments,
  }) =>
      PrayerCalculationSettings(
        method: method ?? this.method,
        asrJuristicMethod: asrJuristicMethod ?? this.asrJuristicMethod,
        locationMode: locationMode ?? this.locationMode,
        location: location ?? this.location,
        manualAdjustments: manualAdjustments ?? this.manualAdjustments,
      );

  String get methodLabel => switch (method) {
        PrayerCalculationMethod.muslimWorldLeague => 'Muslim World League',
        PrayerCalculationMethod.egyptian => 'Egyptian General Authority',
        PrayerCalculationMethod.karachi => 'University of Islamic Sciences, Karachi',
        PrayerCalculationMethod.ummAlQura => 'Umm al-Qura, Makkah',
        PrayerCalculationMethod.northAmerica => 'ISNA North America',
      };

  String get asrLabel => asrJuristicMethod == AsrJuristicMethod.hanafi ? 'Hanafi' : 'Shafi\'i';
}

class PrayerTimesEngine {
  const PrayerTimesEngine();

  List<PrayerRecord> calculateDailyPrayers({required DateTime date, required PrayerCalculationSettings settings, List<PrayerRecord> existing = const []}) {
    final params = _methodParameters(settings.method);
    final times = _calculate(date, settings.location, params, settings.asrJuristicMethod);
    const names = {'fajr': 'Fajr', 'dhuhr': 'Dhuhr', 'asr': 'Asr', 'maghrib': 'Maghrib', 'isha': 'Isha'};
    return names.entries.map((entry) {
      final previous = existing.where((record) => record.id == entry.key).firstOrNull;
      final adjusted = times[entry.key]!.add(Duration(minutes: settings.manualAdjustments[entry.key] ?? 0));
      return PrayerRecord(id: entry.key, name: entry.value, completed: previous?.completed ?? false, timeLabel: _formatTime(adjusted));
    }).toList();
  }

  Map<String, DateTime> _calculate(DateTime date, PrayerLocation location, _MethodParameters params, AsrJuristicMethod asrMethod) {
    final day = _dayOfYear(date);
    final lngHour = location.longitude / 15;
    final noon = _localSolarNoon(date, location, params.dhuhrOffsetMinutes);
    final sunrise = _sunTime(date, day, location, 90.833, true, lngHour);
    final sunset = _sunTime(date, day, location, 90.833, false, lngHour);
    final fajr = _sunTime(date, day, location, 90 + params.fajrAngle, true, lngHour);
    final isha = params.ishaIntervalMinutes == null ? _sunTime(date, day, location, 90 + params.ishaAngle, false, lngHour) : sunset.add(Duration(minutes: params.ishaIntervalMinutes!));
    final asr = noon.add(Duration(minutes: asrMethod == AsrJuristicMethod.hanafi ? 240 : 180));
    return {'fajr': fajr, 'dhuhr': noon, 'asr': asr, 'maghrib': sunset, 'isha': isha};
  }

  DateTime _localSolarNoon(DateTime date, PrayerLocation location, int offsetMinutes) {
    final day = _dayOfYear(date);
    final equation = _equationOfTime(day);
    final minutes = 720 - (4 * location.longitude) - equation + location.timeZoneOffset.inMinutes + offsetMinutes;
    return _dateAtMinutes(date, minutes.round());
  }

  DateTime _sunTime(DateTime date, int day, PrayerLocation location, double zenith, bool rising, double lngHour) {
    final t = day + (((rising ? 6 : 18) - lngHour) / 24);
    final mean = (0.9856 * t) - 3.289;
    var longitude = mean + (1.916 * math.sin(_rad(mean))) + (0.020 * math.sin(_rad(2 * mean))) + 282.634;
    longitude = _normalize(longitude);
    var rightAscension = _deg(math.atan(0.91764 * math.tan(_rad(longitude))));
    rightAscension = _normalize(rightAscension);
    rightAscension += ((longitude / 90).floor() * 90) - ((rightAscension / 90).floor() * 90);
    rightAscension /= 15;
    final sinDec = 0.39782 * math.sin(_rad(longitude));
    final cosDec = math.cos(math.asin(sinDec));
    final cosHour = (math.cos(_rad(zenith)) - (sinDec * math.sin(_rad(location.latitude)))) / (cosDec * math.cos(_rad(location.latitude)));
    if (cosHour < -1 || cosHour > 1) return _localSolarNoon(date, location, 0).add(Duration(hours: rising ? -6 : 6));
    final hour = (rising ? 360 - _deg(math.acos(cosHour)) : _deg(math.acos(cosHour))) / 15;
    final utc = hour + rightAscension - (0.06571 * t) - 6.622 - lngHour;
    return _dateAtMinutes(date, ((utc * 60) + location.timeZoneOffset.inMinutes).round());
  }

  int _dayOfYear(DateTime date) => DateTime(date.year, date.month, date.day).difference(DateTime(date.year)).inDays + 1;
  double _equationOfTime(int day) => 9.87 * math.sin(_rad(2 * ((360 / 365) * (day - 81)))) - 7.53 * math.cos(_rad((360 / 365) * (day - 81))) - 1.5 * math.sin(_rad((360 / 365) * (day - 81)));
  DateTime _dateAtMinutes(DateTime date, int minutes) => DateTime(date.year, date.month, date.day).add(Duration(minutes: minutes));
  double _normalize(double value) => value % 360;
  double _rad(double value) => value * math.pi / 180;
  double _deg(double value) => value * 180 / math.pi;
  String _formatTime(DateTime time) {
    final hour = time.hour % 12 == 0 ? 12 : time.hour % 12;
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute ${time.hour < 12 ? 'AM' : 'PM'}';
  }
}

class _MethodParameters {
  const _MethodParameters({required this.fajrAngle, required this.ishaAngle, this.ishaIntervalMinutes, this.dhuhrOffsetMinutes = 0});
  final double fajrAngle;
  final double ishaAngle;
  final int? ishaIntervalMinutes;
  final int dhuhrOffsetMinutes;
}

_MethodParameters _methodParameters(PrayerCalculationMethod method) => switch (method) {
      PrayerCalculationMethod.muslimWorldLeague => const _MethodParameters(fajrAngle: 18, ishaAngle: 17),
      PrayerCalculationMethod.egyptian => const _MethodParameters(fajrAngle: 19.5, ishaAngle: 17.5),
      PrayerCalculationMethod.karachi => const _MethodParameters(fajrAngle: 18, ishaAngle: 18),
      PrayerCalculationMethod.ummAlQura => const _MethodParameters(fajrAngle: 18.5, ishaAngle: 0, ishaIntervalMinutes: 90),
      PrayerCalculationMethod.northAmerica => const _MethodParameters(fajrAngle: 15, ishaAngle: 15),
    };
