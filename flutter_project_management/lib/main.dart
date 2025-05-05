import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/providers/auth_provider.dart';
import 'package:project_management_app/providers/theme_provider.dart';
import 'package:project_management_app/providers/accessibility_provider.dart';
import 'package:project_management_app/router/app_router.dart';
import 'package:project_management_app/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize any services here
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AccessibilityProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    final router = AppRouter.router;
    
    return MaterialApp.router(
      title: 'Project Management App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme(
        isHighContrast: accessibilityProvider.isHighContrast,
        isLargeText: accessibilityProvider.isLargeText,
      ),
      darkTheme: AppTheme.darkTheme(
        isHighContrast: accessibilityProvider.isHighContrast,
        isLargeText: accessibilityProvider.isLargeText,
      ),
      themeMode: themeProvider.themeMode,
      routerConfig: router,
    );
  }
}