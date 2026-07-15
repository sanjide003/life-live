import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'data/life_repository.dart';
import 'data/life_repository_factory.dart';
import 'screens/life_os_shell.dart';

class LifeOsApp extends StatelessWidget {
  const LifeOsApp({super.key, this.repository});

  final LocalLifeRepository? repository;

  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Livelife',
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF2563EB),
            brightness: Brightness.light,
          ),
          scaffoldBackgroundColor: const Color(0xFFF7F9FC),
          cardTheme: const CardThemeData(
            elevation: 0,
            margin: EdgeInsets.symmetric(vertical: 6),
          ),
        ),
        darkTheme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF60A5FA),
            brightness: Brightness.dark,
          ),
        ),
        home: repository == null ? const _RepositoryBootstrap() : LifeOsShell(repository: repository!),
      ),
    );
  }
}

class _RepositoryBootstrap extends StatelessWidget {
  const _RepositoryBootstrap();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<LocalLifeRepository>(
      future: const LifeRepositoryFactory().openDefault(),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return LifeOsShell(repository: snapshot.requireData);
        }
        if (snapshot.hasError) {
          return Scaffold(body: Center(child: Text('Unable to open local database: ${snapshot.error}')));
        }
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      },
    );
  }
}
