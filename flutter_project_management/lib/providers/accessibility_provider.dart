import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AccessibilityProvider with ChangeNotifier {
  bool _isAccessibilityPanelOpen = false;
  bool _isHighContrast = false;
  bool _isLargeText = false;
  bool _isReadAloud = false;
  String _dateFormat = 'mm-dd-yyyy'; // mm-dd-yyyy or dd-mm-yyyy
  String? _error;
  
  // Getters
  bool get isAccessibilityPanelOpen => _isAccessibilityPanelOpen;
  bool get isHighContrast => _isHighContrast;
  bool get isLargeText => _isLargeText;
  bool get isReadAloud => _isReadAloud;
  String get dateFormat => _dateFormat;
  String? get error => _error;
  
  // Constructor
  AccessibilityProvider() {
    _loadSettings();
  }
  
  // Load settings from shared preferences
  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      _isHighContrast = prefs.getBool('high_contrast') ?? false;
      _isLargeText = prefs.getBool('large_text') ?? false;
      _isReadAloud = prefs.getBool('read_aloud') ?? false;
      _dateFormat = prefs.getString('date_format') ?? 'mm-dd-yyyy';
      
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load accessibility settings: ${e.toString()}';
    }
  }
  
  // Save settings to shared preferences
  Future<void> _saveSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      await prefs.setBool('high_contrast', _isHighContrast);
      await prefs.setBool('large_text', _isLargeText);
      await prefs.setBool('read_aloud', _isReadAloud);
      await prefs.setString('date_format', _dateFormat);
    } catch (e) {
      _error = 'Failed to save accessibility settings: ${e.toString()}';
    }
  }
  
  // Toggle the accessibility panel
  void toggleAccessibilityPanel() {
    _isAccessibilityPanelOpen = !_isAccessibilityPanelOpen;
    notifyListeners();
  }
  
  // Toggle high contrast mode
  void toggleHighContrast() {
    _isHighContrast = !_isHighContrast;
    _saveSettings();
    notifyListeners();
  }
  
  // Toggle large text mode
  void toggleLargeText() {
    _isLargeText = !_isLargeText;
    _saveSettings();
    notifyListeners();
  }
  
  // Toggle screen reader mode
  void toggleReadAloud() {
    _isReadAloud = !_isReadAloud;
    _saveSettings();
    notifyListeners();
  }
  
  // Set date format
  void setDateFormat(String format) {
    if (format == 'mm-dd-yyyy' || format == 'dd-mm-yyyy') {
      _dateFormat = format;
      _saveSettings();
      notifyListeners();
    }
  }
  
  // Reset all settings to defaults
  void resetSettings() {
    _isHighContrast = false;
    _isLargeText = false;
    _isReadAloud = false;
    _dateFormat = 'mm-dd-yyyy';
    _saveSettings();
    notifyListeners();
  }
}