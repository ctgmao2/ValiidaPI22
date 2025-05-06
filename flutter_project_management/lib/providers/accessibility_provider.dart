import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AccessibilityProvider extends ChangeNotifier {
  bool _isAccessibilityPanelOpen = false;
  bool _isHighContrast = false;
  bool _isLargeText = false;
  bool _isReadAloud = false;
  String _dateFormat = 'mm-dd-yyyy'; // Default American format

  bool get isAccessibilityPanelOpen => _isAccessibilityPanelOpen;
  bool get isHighContrast => _isHighContrast;
  bool get isLargeText => _isLargeText;
  bool get isReadAloud => _isReadAloud;
  String get dateFormat => _dateFormat;

  AccessibilityProvider() {
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    
    _isHighContrast = prefs.getBool('isHighContrast') ?? false;
    _isLargeText = prefs.getBool('isLargeText') ?? false;
    _isReadAloud = prefs.getBool('isReadAloud') ?? false;
    _dateFormat = prefs.getString('dateFormat') ?? 'mm-dd-yyyy';
    
    notifyListeners();
  }

  void toggleAccessibilityPanel() {
    _isAccessibilityPanelOpen = !_isAccessibilityPanelOpen;
    notifyListeners();
  }

  Future<void> toggleHighContrast() async {
    _isHighContrast = !_isHighContrast;
    
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isHighContrast', _isHighContrast);
    
    notifyListeners();
  }

  Future<void> toggleLargeText() async {
    _isLargeText = !_isLargeText;
    
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isLargeText', _isLargeText);
    
    notifyListeners();
  }

  Future<void> toggleReadAloud() async {
    _isReadAloud = !_isReadAloud;
    
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isReadAloud', _isReadAloud);
    
    notifyListeners();
  }
  
  Future<void> setDateFormat(String format) async {
    _dateFormat = format;
    
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('dateFormat', format);
    
    notifyListeners();
  }

  // Format date according to user's preference
  String formatDate(DateTime date) {
    if (_dateFormat == 'dd-mm-yyyy') {
      // Brazilian format
      return '${date.day.toString().padLeft(2, '0')}-${date.month.toString().padLeft(2, '0')}-${date.year}';
    } else {
      // American format (default)
      return '${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}-${date.year}';
    }
  }
}