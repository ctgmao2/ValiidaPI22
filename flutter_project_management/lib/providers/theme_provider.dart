import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  String _accentColor = '#4f46e5'; // Default indigo color

  ThemeMode get themeMode => _themeMode;
  String get accentColor => _accentColor;
  
  // Getter for Color object from hex string
  Color get primaryColor => _hexToColor(_accentColor);

  ThemeProvider() {
    _loadSettings();
  }

  Color _hexToColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  Future<void> _loadSettings() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    
    // Load theme mode
    final String? themeModeString = prefs.getString('themeMode');
    if (themeModeString != null) {
      switch (themeModeString) {
        case 'light':
          _themeMode = ThemeMode.light;
          break;
        case 'dark':
          _themeMode = ThemeMode.dark;
          break;
        default:
          _themeMode = ThemeMode.system;
      }
    }
    
    // Load accent color
    final String? accentColorValue = prefs.getString('accentColor');
    if (accentColorValue != null) {
      _accentColor = accentColorValue;
    }
    
    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    
    // Save to preferences
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    String themeModeString;
    
    switch (mode) {
      case ThemeMode.light:
        themeModeString = 'light';
        break;
      case ThemeMode.dark:
        themeModeString = 'dark';
        break;
      default:
        themeModeString = 'system';
    }
    
    await prefs.setString('themeMode', themeModeString);
    notifyListeners();
  }
  
  Future<void> setAccentColor(String colorHex) async {
    _accentColor = colorHex;
    
    // Save to preferences
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('accentColor', colorHex);
    notifyListeners();
  }
}