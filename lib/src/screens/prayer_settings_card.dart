part of 'life_os_shell.dart';

class PrayerSettingsCard extends StatelessWidget {
  const PrayerSettingsCard({super.key, required this.settings, required this.onChanged});

  final PrayerCalculationSettings settings;
  final ValueChanged<PrayerCalculationSettings> onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.settings),
              title: const Text('Prayer calculation settings'),
              subtitle: Text('${settings.methodLabel} • ${settings.asrLabel} Asr • ${settings.location.label}'),
            ),
            DropdownButtonFormField<PrayerCalculationMethod>(
              value: settings.method,
              decoration: const InputDecoration(labelText: 'Calculation method'),
              items: PrayerCalculationMethod.values.map((method) {
                final label = settings.copyWith(method: method).methodLabel;
                return DropdownMenuItem(value: method, child: Text(label));
              }).toList(),
              onChanged: (method) => method == null ? null : onChanged(settings.copyWith(method: method)),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<AsrJuristicMethod>(
              value: settings.asrJuristicMethod,
              decoration: const InputDecoration(labelText: 'Asr option'),
              items: const [
                DropdownMenuItem(value: AsrJuristicMethod.shafii, child: Text('Shafi\'i')),
                DropdownMenuItem(value: AsrJuristicMethod.hanafi, child: Text('Hanafi')),
              ],
              onChanged: (method) => method == null ? null : onChanged(settings.copyWith(asrJuristicMethod: method)),
            ),
            const SizedBox(height: 8),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: settings.locationMode == PrayerLocationMode.automatic,
              title: const Text('Automatic location-based calculation'),
              subtitle: Text('Timezone offset: UTC${settings.location.timeZoneOffset.inHours >= 0 ? '+' : ''}${settings.location.timeZoneOffset.inHours} with daylight handling from the device'),
              onChanged: (automatic) => onChanged(settings.copyWith(locationMode: automatic ? PrayerLocationMode.automatic : PrayerLocationMode.manual)),
            ),
            Wrap(spacing: 8, runSpacing: 8, children: [
              OutlinedButton(onPressed: () => onChanged(settings.copyWith(location: const PrayerLocation(label: 'New York, United States', latitude: 40.7128, longitude: -74.0060, timeZoneOffset: Duration(hours: -4)), locationMode: PrayerLocationMode.manual)), child: const Text('New York')),
              OutlinedButton(onPressed: () => onChanged(settings.copyWith(location: const PrayerLocation(label: 'Makkah, Saudi Arabia', latitude: 21.3891, longitude: 39.8579, timeZoneOffset: Duration(hours: 3)), locationMode: PrayerLocationMode.manual)), child: const Text('Makkah')),
              OutlinedButton(onPressed: () => onChanged(settings.copyWith(location: const PrayerLocation(label: 'London, United Kingdom', latitude: 51.5072, longitude: -0.1276, timeZoneOffset: Duration(hours: 1)), locationMode: PrayerLocationMode.manual)), child: const Text('London')),
            ]),
            const SizedBox(height: 8),
            const Text('Manual prayer time adjustment'),
            Wrap(spacing: 8, children: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((id) {
              final value = settings.manualAdjustments[id] ?? 0;
              return InputChip(
                label: Text('${id[0].toUpperCase()}${id.substring(1)} ${value >= 0 ? '+' : ''}$value min'),
                onPressed: () {
                  final next = Map<String, int>.from(settings.manualAdjustments)..[id] = value + 1;
                  onChanged(settings.copyWith(manualAdjustments: next));
                },
                onDeleted: value == 0 ? null : () {
                  final next = Map<String, int>.from(settings.manualAdjustments)..[id] = 0;
                  onChanged(settings.copyWith(manualAdjustments: next));
                },
              );
            }).toList()),
          ],
        ),
      ),
    );
  }
}
