import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://api.projectmanagement.app';
  
  static Future<Map<String, dynamic>> _handleResponse(http.Response response) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else if (response.statusCode == 401) {
      // Clear invalid session
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.remove('user');
      throw Exception('Unauthorized: Please login again');
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }
  
  static Future<Map<String, dynamic>> _get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }
  
  static Future<Map<String, dynamic>> _post(String endpoint, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: await _getHeaders(),
      body: json.encode(data),
    );
    return _handleResponse(response);
  }
  
  static Future<Map<String, dynamic>> _patch(String endpoint, Map<String, dynamic> data) async {
    final response = await http.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: await _getHeaders(),
      body: json.encode(data),
    );
    return _handleResponse(response);
  }
  
  static Future<Map<String, dynamic>> _delete(String endpoint) async {
    final response = await http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }
  
  static Future<Map<String, String>> _getHeaders() async {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }
  
  // Auth endpoints
  static Future<Map<String, dynamic>> login(String username, String password) async {
    return _post('/api/auth/login', {
      'username': username,
      'password': password,
    });
  }
  
  static Future<bool> logout() async {
    try {
      await _post('/api/auth/logout', {});
      return true;
    } catch (e) {
      return false;
    }
  }
  
  static Future<bool> validateSession() async {
    try {
      await _get('/api/auth/validate');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  static Future<Map<String, dynamic>> getCurrentUser() async {
    return _get('/api/users/me');
  }
  
  // User endpoints
  static Future<List<dynamic>> getUsers() async {
    final response = await _get('/api/users');
    return response['data'] ?? [];
  }
  
  static Future<Map<String, dynamic>> getUser(int id) async {
    return _get('/api/users/$id');
  }
  
  static Future<Map<String, dynamic>> createUser(Map<String, dynamic> userData) async {
    return _post('/api/users', userData);
  }
  
  static Future<Map<String, dynamic>> updateUser(int id, Map<String, dynamic> userData) async {
    return _patch('/api/users/$id', userData);
  }
  
  static Future<bool> deleteUser(int id) async {
    try {
      await _delete('/api/users/$id');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Project endpoints
  static Future<List<dynamic>> getProjects() async {
    final response = await _get('/api/projects');
    return response['data'] ?? [];
  }
  
  static Future<Map<String, dynamic>> getProject(int id) async {
    return _get('/api/projects/$id');
  }
  
  static Future<Map<String, dynamic>> createProject(Map<String, dynamic> projectData) async {
    return _post('/api/projects', projectData);
  }
  
  static Future<Map<String, dynamic>> updateProject(int id, Map<String, dynamic> projectData) async {
    return _patch('/api/projects/$id', projectData);
  }
  
  static Future<bool> deleteProject(int id) async {
    try {
      await _delete('/api/projects/$id');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Task endpoints
  static Future<List<dynamic>> getTasks() async {
    final response = await _get('/api/tasks');
    return response['data'] ?? [];
  }
  
  static Future<List<dynamic>> getTasksByProject(int projectId) async {
    final response = await _get('/api/tasks?projectId=$projectId');
    return response['data'] ?? [];
  }
  
  static Future<Map<String, dynamic>> getTask(int id) async {
    return _get('/api/tasks/$id');
  }
  
  static Future<Map<String, dynamic>> createTask(Map<String, dynamic> taskData) async {
    return _post('/api/tasks', taskData);
  }
  
  static Future<Map<String, dynamic>> updateTask(int id, Map<String, dynamic> taskData) async {
    return _patch('/api/tasks/$id', taskData);
  }
  
  static Future<bool> deleteTask(int id) async {
    try {
      await _delete('/api/tasks/$id');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  static Future<Map<String, dynamic>> updateTaskStatus(int id, String status) async {
    return _patch('/api/tasks/$id/status', {'status': status});
  }
  
  // Dashboard endpoints
  static Future<Map<String, dynamic>> getDashboardStats() async {
    return _get('/api/dashboard/stats');
  }
  
  static Future<List<dynamic>> getTasksDueSoon() async {
    final response = await _get('/api/dashboard/due-soon');
    return response['data'] ?? [];
  }
  
  // Activity endpoints
  static Future<List<dynamic>> getRecentActivities() async {
    final response = await _get('/api/activities/recent');
    return response['data'] ?? [];
  }
}