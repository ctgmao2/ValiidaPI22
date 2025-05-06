import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:project_management_app/providers/auth_provider.dart';
import 'package:project_management_app/providers/theme_provider.dart';
import 'package:project_management_app/providers/accessibility_provider.dart';
import 'package:project_management_app/router/app_router.dart';

void main() async {
  // Ensure Flutter is initialized
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  
  // Run the app
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Auth provider
        ChangeNotifierProvider(
          create: (_) => AuthProvider(),
        ),
        
        // Theme provider
        ChangeNotifierProvider(
          create: (_) => ThemeProvider(),
        ),
        
        // Accessibility provider
        ChangeNotifierProvider(
          create: (_) => AccessibilityProvider(),
        ),
      ],
      child: const AppWithProviders(),
    );
  }
}

class AppWithProviders extends StatelessWidget {
  const AppWithProviders({super.key});

  @override
  Widget build(BuildContext context) {
    // Get providers
    final themeProvider = Provider.of<ThemeProvider>(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    
    // Get appropriate theme
    final ThemeData theme = accessibilityProvider.isHighContrast
        ? AppTheme.getHighContrastTheme(
            themeProvider.themeMode == ThemeMode.dark
                ? Brightness.dark
                : Brightness.light,
          )
        : themeProvider.getTheme(
            themeProvider.themeMode == ThemeMode.dark
                ? Brightness.dark
                : Brightness.light,
          );
    
    // Create router
    final GoRouter router = AppRouter.createRouter(context);
    
    return MaterialApp.router(
      // Router configuration
      routerConfig: router,
      
      // App title
      title: 'Project Management',
      
      // Theme configuration
      theme: themeProvider.getTheme(Brightness.light),
      darkTheme: themeProvider.getTheme(Brightness.dark),
      themeMode: themeProvider.themeMode,
      
      // Localization
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', 'US'), // English
        Locale('pt', 'BR'), // Brazilian Portuguese
      ],
      
      // Other app settings
      debugShowCheckedModeBanner: false,
      
      // Accessibility settings
      builder: (context, child) {
        // Apply accessibility text scaling
        final MediaQueryData data = MediaQuery.of(context);
        final textScaleFactor = accessibilityProvider.isLargeText ? 1.3 : 1.0;
        
        return MediaQuery(
          data: data.copyWith(
            textScaleFactor: textScaleFactor,
          ),
          child: child!,
        );
      },
    );
  }
}