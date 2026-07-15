import 'package:flutter/material.dart';

class LivelifeSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
}

class LivelifeThemeFactory {
  const LivelifeThemeFactory();

  ThemeData build(Brightness brightness) => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: brightness == Brightness.dark ? const Color(0xFF60A5FA) : const Color(0xFF2563EB), brightness: brightness),
        visualDensity: VisualDensity.standard,
        cardTheme: const CardThemeData(elevation: 0, margin: EdgeInsets.symmetric(vertical: LivelifeSpacing.sm)),
      );
}

class UiStateMessage {
  const UiStateMessage({required this.title, required this.description, required this.semanticLabel});
  final String title;
  final String description;
  final String semanticLabel;
}

const emptyStateMessage = UiStateMessage(title: 'Nothing here yet', description: 'Add your first item to get started.', semanticLabel: 'Empty state');
const loadingStateMessage = UiStateMessage(title: 'Loading Livelife', description: 'Preparing your local-first workspace.', semanticLabel: 'Loading state');
const errorStateMessage = UiStateMessage(title: 'Something went wrong', description: 'Your local data is safe. Try again.', semanticLabel: 'Error state');
