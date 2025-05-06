import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:project_management_app/models/user_model.dart';
import 'package:project_management_app/services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;

  AuthProvider() {
    _loadUserFromStorage();
  }

  Future<void> _loadUserFromStorage() async {
    _isLoading = true;
    notifyListeners();

    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? userJson = prefs.getString('user');
      
      if (userJson != null) {
        // Verify with backend that session is still valid
        final bool isValid = await ApiService.validateSession();
        
        if (isValid) {
          // Load user data
          final userData = await ApiService.getCurrentUser();
          _currentUser = User.fromJson(userData);
          _isAuthenticated = true;
        } else {
          // Clear invalid session
          await prefs.remove('user');
          _isAuthenticated = false;
        }
      }
    } catch (e) {
      _error = 'Failed to load user data: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.login(username, password);
      
      if (response['id'] != null) {
        _currentUser = User.fromJson(response);
        _isAuthenticated = true;
        
        // Save to storage
        final SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', response.toString());
        
        notifyListeners();
        return true;
      } else {
        _error = 'Invalid credentials';
        _isAuthenticated = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Login failed: ${e.toString()}';
      _isAuthenticated = false;
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.logout();
      
      // Clear local storage
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.remove('user');
      
      _currentUser = null;
      _isAuthenticated = false;
    } catch (e) {
      _error = 'Logout failed: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}