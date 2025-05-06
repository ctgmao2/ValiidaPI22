import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Private constructor to prevent instantiation
  AppTheme._();
  
  // Light theme
  static ThemeData lightTheme({
    bool isHighContrast = false,
    bool isLargeText = false,
  }) {
    final ColorScheme colorScheme = ColorScheme.light(
      primary: const Color(0xFF4F46E5), // Default indigo
      onPrimary: Colors.white,
      primaryContainer: const Color(0xFFE0E7FF),
      onPrimaryContainer: const Color(0xFF1E2B3C),
      secondary: const Color(0xFF6C63FF),
      onSecondary: Colors.white,
      background: Colors.white,
      onBackground: Colors.black,
      surface: Colors.white,
      onSurface: Colors.black,
      error: const Color(0xFFDC2626),
      onError: Colors.white,
    );
    
    // Create high contrast color scheme if needed
    final ColorScheme themeColorScheme = isHighContrast 
      ? colorScheme.copyWith(
          primary: const Color(0xFF0000CC), // Darker blue for high contrast
          onPrimary: Colors.white,
          secondary: const Color(0xFF5500CC),
          background: Colors.white,
          onBackground: Colors.black,
          surface: Colors.white,
          onSurface: Colors.black,
          error: const Color(0xFFCC0000),
        )
      : colorScheme;
    
    // Adjust text theme based on accessibility settings
    final TextTheme textTheme = GoogleFonts.interTextTheme(ThemeData.light().textTheme);
    final TextTheme adjustedTextTheme = isLargeText 
      ? textTheme.copyWith(
          bodyLarge: textTheme.bodyLarge?.copyWith(fontSize: 18.0),
          bodyMedium: textTheme.bodyMedium?.copyWith(fontSize: 16.0),
          bodySmall: textTheme.bodySmall?.copyWith(fontSize: 14.0),
          titleLarge: textTheme.titleLarge?.copyWith(fontSize: 24.0),
          titleMedium: textTheme.titleMedium?.copyWith(fontSize: 20.0),
          titleSmall: textTheme.titleSmall?.copyWith(fontSize: 16.0),
        )
      : textTheme;
    
    return ThemeData(
      useMaterial3: true,
      colorScheme: themeColorScheme,
      primaryColor: themeColorScheme.primary,
      scaffoldBackgroundColor: const Color(0xFFF8FAFC), // Slightly off white
      textTheme: adjustedTextTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: themeColorScheme.surface,
        foregroundColor: themeColorScheme.onSurface,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          foregroundColor: themeColorScheme.onPrimary,
          backgroundColor: themeColorScheme.primary,
          minimumSize: const Size(0, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: themeColorScheme.primary,
          minimumSize: const Size(0, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: themeColorScheme.primary,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
      cardTheme: CardTheme(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
        color: themeColorScheme.surface,
      ),
      tabBarTheme: TabBarTheme(
        labelColor: themeColorScheme.primary,
        unselectedLabelColor: themeColorScheme.onSurface.withOpacity(0.7),
        indicatorColor: themeColorScheme.primary,
      ),
      dividerTheme: DividerThemeData(
        color: themeColorScheme.onSurface.withOpacity(0.1),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: MaterialStateProperty.resolveWith<Color?>((states) {
          if (states.contains(MaterialState.selected)) {
            return themeColorScheme.primary;
          }
          return null;
        }),
      ),
    );
  }

  // Dark theme
  static ThemeData darkTheme({
    bool isHighContrast = false,
    bool isLargeText = false,
  }) {
    final ColorScheme colorScheme = ColorScheme.dark(
      primary: const Color(0xFF818CF8), // Lighter indigo for dark mode
      onPrimary: Colors.black,
      primaryContainer: const Color(0xFF3730A3),
      onPrimaryContainer: Colors.white,
      secondary: const Color(0xFFA5B4FC),
      onSecondary: Colors.black,
      background: const Color(0xFF121212),
      onBackground: Colors.white,
      surface: const Color(0xFF1E1E1E),
      onSurface: Colors.white,
      error: const Color(0xFFF87171),
      onError: Colors.black,
    );
    
    // Create high contrast color scheme if needed
    final ColorScheme themeColorScheme = isHighContrast 
      ? colorScheme.copyWith(
          primary: const Color(0xFF7C7CFF), // Lighter blue for dark high contrast
          onPrimary: Colors.black,
          secondary: const Color(0xFF9E70FF),
          background: Colors.black,
          onBackground: Colors.white,
          surface: const Color(0xFF121212),
          onSurface: Colors.white,
          error: const Color(0xFFFF7070),
        )
      : colorScheme;
    
    // Adjust text theme based on accessibility settings
    final TextTheme textTheme = GoogleFonts.interTextTheme(ThemeData.dark().textTheme);
    final TextTheme adjustedTextTheme = isLargeText 
      ? textTheme.copyWith(
          bodyLarge: textTheme.bodyLarge?.copyWith(fontSize: 18.0),
          bodyMedium: textTheme.bodyMedium?.copyWith(fontSize: 16.0),
          bodySmall: textTheme.bodySmall?.copyWith(fontSize: 14.0),
          titleLarge: textTheme.titleLarge?.copyWith(fontSize: 24.0),
          titleMedium: textTheme.titleMedium?.copyWith(fontSize: 20.0),
          titleSmall: textTheme.titleSmall?.copyWith(fontSize: 16.0),
        )
      : textTheme;
    
    return ThemeData(
      useMaterial3: true,
      colorScheme: themeColorScheme,
      primaryColor: themeColorScheme.primary,
      scaffoldBackgroundColor: const Color(0xFF0A0A0A), // Dark background
      textTheme: adjustedTextTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: themeColorScheme.surface,
        foregroundColor: themeColorScheme.onSurface,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          foregroundColor: themeColorScheme.onPrimary,
          backgroundColor: themeColorScheme.primary,
          minimumSize: const Size(0, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: themeColorScheme.primary,
          minimumSize: const Size(0, 48),
          side: BorderSide(color: themeColorScheme.primary.withOpacity(0.5)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: themeColorScheme.primary,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        fillColor: themeColorScheme.surface,
        filled: true,
      ),
      cardTheme: CardTheme(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
        color: themeColorScheme.surface,
      ),
      tabBarTheme: TabBarTheme(
        labelColor: themeColorScheme.primary,
        unselectedLabelColor: themeColorScheme.onSurface.withOpacity(0.7),
        indicatorColor: themeColorScheme.primary,
      ),
      dividerTheme: DividerThemeData(
        color: themeColorScheme.onSurface.withOpacity(0.2),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: MaterialStateProperty.resolveWith<Color?>((states) {
          if (states.contains(MaterialState.selected)) {
            return themeColorScheme.primary;
          }
          return null;
        }),
      ),
    );
  }
}