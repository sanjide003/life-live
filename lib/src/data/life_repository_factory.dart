import 'dart:io';

import 'package:path_provider/path_provider.dart';

import 'life_repository.dart';
import 'sqlite_life_store.dart';

class LifeRepositoryFactory {
  const LifeRepositoryFactory();

  Future<LocalLifeRepository> openDefault() async {
    final directory = await getApplicationDocumentsDirectory();
    final store = SqliteLifeLocalStore(File('${directory.path}/livelife.db'));
    return LocalLifeRepository.seeded(store: store);
  }
}
