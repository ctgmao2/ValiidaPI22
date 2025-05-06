import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:project_management_app/theme/app_theme.dart';

class ThemeProvider with ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  String _colorSchemeName = 'blue';
  bool _useMaterial3 = true;
  double _borderRadius = 8.0;
  String? _error;
  
  // Getters
  ThemeMode get themeMode => _themeMode;
  String get colorSchemeName => _colorSchemeName;
  bool get useMaterial3 => _useMaterial3;
  double get borderRadius => _borderRadius;
  String? get error => _error;
  
  // Get the current theme data
  ThemeData getTheme(Brightness brightness) {
    return AppTheme.getThemeData(
      brightness: brightness, 
      colorSchemeName: _colorSchemeName,
      useMaterial3: _useMaterial3,
      borderRadius: _borderRadius,
    );
  }
  
  // Constructor
  ThemeProvider() {
    _loadSettings();
  }
  
  // Load settings from shared preferences
  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      final themeModeString = prefs.getString('theme_mode') ?? 'system';
      _themeMode = _parseThemeMode(themeModeString);
      
      _colorSchemeName = prefs.getString('color_scheme') ?? 'blue';
      _useMaterial3 = prefs.getBool('use_material3') ?? true;
      _borderRadius = prefs.getDouble('border_radius') ?? 8.0;
      
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load theme settings: ${e.toString()}';
    }
  }
  
  // Save settings to shared preferences
  Future<void> _saveSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      await prefs.setString('theme_mode', _themeModeToString(_themeMode));
      await prefs.setString('color_scheme', _colorSchemeName);
      await prefs.setBool('use_material3', _useMaterial3);
      await prefs.setDouble('border_radius', _borderRadius);
    } catch (e) {
      _error = 'Failed to save theme settings: ${e.toString()}';
    }
  }
  
  // Set theme mode (light, dark, system)
  void setThemeMode(ThemeMode mode) {
    _themeMode = mode;
    _saveSettings();
    notifyListeners();
  }
  
  // Set color scheme name
  void setColorScheme(String name) {
    if (AppTheme.availableColorSchemes.contains(name)) {
      _colorSchemeName = name;
      _saveSettings();
      notifyListeners();
    }
  }
  
  // Toggle Material 3
  void toggleMaterial3() {
    _useMaterial3 = !_useMaterial3;
    _saveSettings();
    notifyListeners();
  }
  
  // Set border radius
  void setBorderRadius(double radius) {
    _borderRadius = radius;
    _saveSettings();
    notifyListeners();
  }
  
  // Reset all settings to defaults
  void resetSettings() {
    _themeMode = ThemeMode.system;
    _colorSchemeName = 'blue';
    _useMaterial3 = true;
    _borderRadius = 8.0;
    _saveSettings();
    notifyListeners();
  }
  
  // Helper methods
  ThemeMode _parseThemeMode(String themeModeString) {
    switch (themeModeString) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }
  
  String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
      default:
        return 'system';
    }
  }
}