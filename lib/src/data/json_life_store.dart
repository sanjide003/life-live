import 'dart:convert';
import 'dart:io';

import 'life_repository.dart';

class JsonFileLifeLocalStore implements LifeLocalStore {
  JsonFileLifeLocalStore(this.file);

  final File file;

  @override
  Map<String, Object?>? readSnapshot() {
    if (!file.existsSync()) {
      return null;
    }
    final decoded = jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
    return Map<String, Object?>.from(decoded);
  }

  @override
  void writeSnapshot(Map<String, Object?> snapshot) {
    file.parent.createSync(recursive: true);
    const encoder = JsonEncoder.withIndent('  ');
    file.writeAsStringSync(encoder.convert(snapshot), flush: true);
  }
}
