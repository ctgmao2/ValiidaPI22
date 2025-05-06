import 'package:flutter/material.dart';

class AppTheme {
  // Available color schemes
  static const List<String> availableColorSchemes = [
    'blue',
    'green',
    'purple',
    'orange',
    'red',
    'teal',
  ];

  // Get primary color from color scheme name
  static Color getPrimaryColor(String colorSchemeName) {
    switch (colorSchemeName) {
      case 'blue':
        return Colors.blue;
      case 'green':
        return Colors.green;
      case 'purple':
        return Colors.purple;
      case 'orange':
        return Colors.orange;
      case 'red':
        return Colors.red;
      case 'teal':
        return Colors.teal;
      default:
        return Colors.blue;
    }
  }

  // Get color scheme from color name and brightness
  static ColorScheme getColorScheme({
    required Brightness brightness,
    required String colorSchemeName,
  }) {
    final primaryColor = getPrimaryColor(colorSchemeName);
    
    if (brightness == Brightness.dark) {
      return ColorScheme.dark(
        primary: primaryColor,
        secondary: primaryColor.withOpacity(0.8),
        tertiary: primaryColor.withOpacity(0.6),
        surface: const Color(0xFF1E1E1E),
        background: const Color(0xFF121212),
        error: Colors.red.shade700,
      );
    } else {
      return ColorScheme.light(
        primary: primaryColor,
        secondary: primaryColor.withOpacity(0.8),
        tertiary: primaryColor.withOpacity(0.6),
        surface: Colors.white,
        background: const Color(0xFFF5F5F5),
        error: Colors.red.shade700,
      );
    }
  }

  // Get theme data
  static ThemeData getThemeData({
    required Brightness brightness,
    required String colorSchemeName,
    required bool useMaterial3,
    required double borderRadius,
  }) {
    final colorScheme = getColorScheme(
      brightness: brightness,
      colorSchemeName: colorSchemeName,
    );
    
    return ThemeData(
      colorScheme: colorScheme,
      useMaterial3: useMaterial3,
      brightness: brightness,
      
      // Text theme
      textTheme: _getTextTheme(brightness),
      
      // App bar theme
      appBarTheme: AppBarTheme(
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
      ),
      
      // Card theme
      cardTheme: CardTheme(
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
      
      // Button themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
      
      // Input decoration theme
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        filled: true,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
      
      // Divider theme
      dividerTheme: const DividerThemeData(
        space: 1,
        thickness: 1,
      ),
      
      // Checkbox theme
      checkboxTheme: CheckboxThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      
      // Bottom navigation bar theme
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        selectedItemColor: colorScheme.primary,
        unselectedItemColor: colorScheme.onSurface.withOpacity(0.6),
      ),
      
      // Floating action button theme
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      
      // List tile theme
      listTileTheme: ListTileThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
      
      // Dialog theme
      dialogTheme: DialogTheme(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
      
      // Snackbar theme
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
  
  // Get text theme based on brightness
  static TextTheme _getTextTheme(Brightness brightness) {
    return brightness == Brightness.dark
        ? _darkTextTheme
        : _lightTextTheme;
  }
  
  // Light text theme
  static final TextTheme _lightTextTheme = TextTheme(
    displayLarge: const TextStyle(
      fontSize: 96,
      fontWeight: FontWeight.w300,
      color: Colors.black87,
    ),
    displayMedium: const TextStyle(
      fontSize: 60,
      fontWeight: FontWeight.w300,
      color: Colors.black87,
    ),
    displaySmall: const TextStyle(
      fontSize: 48,
      fontWeight: FontWeight.w400,
      color: Colors.black87,
    ),
    headlineMedium: const TextStyle(
      fontSize: 34,
      fontWeight: FontWeight.w400,
      color: Colors.black87,
    ),
    headlineSmall: const TextStyle(
      fontSize: 24,
      fontWeight: FontWeight.w400,
      color: Colors.black87,
    ),
    titleLarge: const TextStyle(
      fontSize: 20,
      fontWeight: FontWeight.w500,
      color: Colors.black87,
    ),
    titleMedium: const TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.w500,
      color: Colors.black87,
    ),
    titleSmall: const TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.w500,
      color: Colors.black87,
    ),
    bodyLarge: const TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.w400,
      color: Colors.black87,
    ),
    bodyMedium: const TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: Colors.black87,
    ),
    bodySmall: TextStyle(
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: Colors.black.withOpacity(0.6),
    ),
    labelLarge: const TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.w500,
      color: Colors.black87,
    ),
  );
  
  // Dark text theme
  static final TextTheme _darkTextTheme = TextTheme(
    displayLarge: const TextStyle(
      fontSize: 96,
      fontWeight: FontWeight.w300,
      color: Colors.white,
    ),
    displayMedium: const TextStyle(
      fontSize: 60,
      fontWeight: FontWeight.w300,
      color: Colors.white,
    ),
    displaySmall: const TextStyle(
      fontSize: 48,
      fontWeight: FontWeight.w400,
      color: Colors.white,
    ),
    headlineMedium: const TextStyle(
      fontSize: 34,
      fontWeight: FontWeight.w400,
      color: Colors.white,
    ),
    headlineSmall: const TextStyle(
      fontSize: 24,
      fontWeight: FontWeight.w400,
      color: Colors.white,
    ),
    titleLarge: const TextStyle(
      fontSize: 20,
      fontWeight: FontWeight.w500,
      color: Colors.white,
    ),
    titleMedium: const TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.w500,
      color: Colors.white,
    ),
    titleSmall: const TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.w500,
      color: Colors.white,
    ),
    bodyLarge: const TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.w400,
      color: Colors.white,
    ),
    bodyMedium: const TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: Colors.white,
    ),
    bodySmall: TextStyle(
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: Colors.white.withOpacity(0.6),
    ),
    labelLarge: const TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.w500,
      color: Colors.white,
    ),
  );
  
  // High contrast theme for accessibility
  static ThemeData getHighContrastTheme(Brightness brightness) {
    // Use higher contrast colors for accessibility
    final isLightMode = brightness == Brightness.light;
    
    final colorScheme = isLightMode
        ? const ColorScheme.light(
            primary: Color(0xFF000088),
            onPrimary: Colors.white,
            secondary: Color(0xFF006600),
            onSecondary: Colors.white,
            background: Colors.white,
            onBackground: Colors.black,
            surface: Colors.white,
            onSurface: Colors.black,
            error: Color(0xFFCC0000),
            onError: Colors.white,
          )
        : const ColorScheme.dark(
            primary: Color(0xFF6688FF),
            onPrimary: Colors.black,
            secondary: Color(0xFF66FF66),
            onSecondary: Colors.black,
            background: Colors.black,
            onBackground: Colors.white,
            surface: Color(0xFF121212),
            onSurface: Colors.white,
            error: Color(0xFFFF6666),
            onError: Colors.black,
          );
    
    return ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      brightness: brightness,
      
      // Increase text contrast
      textTheme: isLightMode
          ? _lightTextTheme.apply(
              bodyColor: Colors.black,
              displayColor: Colors.black,
            )
          : _darkTextTheme.apply(
              bodyColor: Colors.white,
              displayColor: Colors.white,
            ),
      
      // Increase button contrast
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          foregroundColor: colorScheme.onPrimary,
          backgroundColor: colorScheme.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(
              color: isLightMode ? Colors.black : Colors.white,
              width: 1.5,
            ),
          ),
        ),
      ),
      
      // Increase input field contrast
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: isLightMode ? Colors.black : Colors.white,
            width: 1.5,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: isLightMode ? Colors.black : Colors.white,
            width: 1.5,
          ),
        ),
        filled: true,
        fillColor: isLightMode ? Colors.white : const Color(0xFF121212),
        hintStyle: TextStyle(
          color: isLightMode
              ? Colors.black.withOpacity(0.7)
              : Colors.white.withOpacity(0.7),
        ),
      ),
      
      // Increase card contrast
      cardTheme: CardTheme(
        color: colorScheme.surface,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: isLightMode ? Colors.black : Colors.white,
            width: 1.0,
          ),
        ),
      ),
      
      // Increase divider contrast
      dividerTheme: DividerThemeData(
        color: isLightMode ? Colors.black : Colors.white,
        thickness: 1.5,
      ),
    );
  }
}