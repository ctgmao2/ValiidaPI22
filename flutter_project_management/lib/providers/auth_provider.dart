import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:project_management_app/services/api_service.dart';
import 'package:project_management_app/models/user_model.dart';

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isAuthenticated = false;
  String? _error;
  bool _isLoading = false;
  
  // Getters
  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;
  bool get isLoading => _isLoading;
  
  // Constructor
  AuthProvider() {
    _loadUserFromStorage();
  }
  
  // Load user from shared preferences on app start
  Future<void> _loadUserFromStorage() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user');
      
      if (userJson != null) {
        // User info is stored, try to parse it
        try {
          final userData = Map<String, dynamic>.from(
              userJson as Map<dynamic, dynamic>);
          _currentUser = User.fromJson(userData);
          _isAuthenticated = true;
        } catch (e) {
          // Clear invalid user data
          prefs.remove('user');
          _currentUser = null;
          _isAuthenticated = false;
        }
      } else {
        _currentUser = null;
        _isAuthenticated = false;
      }
    } catch (e) {
      _currentUser = null;
      _isAuthenticated = false;
      _error = 'Failed to load user data: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Login
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final userData = await ApiService.login(username, password);
      _currentUser = User.fromJson(userData);
      _isAuthenticated = true;
      
      // Save user to shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', userData.toString());
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _currentUser = null;
      _isAuthenticated = false;
      _error = 'Login failed: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      await ApiService.logout();
    } catch (e) {
      // Continue logout even if API call fails
      _error = 'Logout API error: ${e.toString()}';
    }
    
    try {
      // Clear stored user data
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user');
    } catch (e) {
      _error = 'Failed to clear local data: ${e.toString()}';
    }
    
    _currentUser = null;
    _isAuthenticated = false;
    _isLoading = false;
    notifyListeners();
  }
  
  // Update user profile
  Future<bool> updateProfile(Map<String, dynamic> userData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      if (_currentUser == null) {
        throw Exception('Not logged in');
      }
      
      final updatedUserData = await ApiService.updateUser(_currentUser!.id, userData);
      _currentUser = User.fromJson(updatedUserData);
      
      // Update stored user data
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', updatedUserData.toString());
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to update profile: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}