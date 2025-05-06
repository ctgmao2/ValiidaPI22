import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Base URL for API - will be different for development vs production
  static const String baseUrl = 'http://localhost:5000/api';
  
  // HTTP client with automatic cookie handling
  static final http.Client _client = http.Client();
  
  // Default headers for API requests
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Authentication methods
  static Future<Map<String, dynamic>> login(String username, String password) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers,
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Login failed: ${e.toString()}');
    }
  }
  
  static Future<void> logout() async {
    try {
      await _client.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: _headers,
      );
    } catch (e) {
      throw Exception('Logout failed: ${e.toString()}');
    }
  }
  
  // User methods
  static Future<List<dynamic>> getUsers() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/users'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get users: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> getUser(int id) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/users/$id'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get user: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> createUser(Map<String, dynamic> userData) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/users'),
        headers: _headers,
        body: jsonEncode(userData),
      );
      
      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to create user: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> updateUser(int id, Map<String, dynamic> userData) async {
    try {
      final response = await _client.patch(
        Uri.parse('$baseUrl/users/$id'),
        headers: _headers,
        body: jsonEncode(userData),
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to update user: ${e.toString()}');
    }
  }
  
  static Future<void> deleteUser(int id) async {
    try {
      final response = await _client.delete(
        Uri.parse('$baseUrl/users/$id'),
        headers: _headers,
      );
      
      if (response.statusCode != 200) {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to delete user: ${e.toString()}');
    }
  }
  
  // Project methods
  static Future<List<dynamic>> getProjects() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/projects'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get projects: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> getProject(int id) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/projects/$id'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get project: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> createProject(Map<String, dynamic> projectData) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/projects'),
        headers: _headers,
        body: jsonEncode(projectData),
      );
      
      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to create project: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> updateProject(int id, Map<String, dynamic> projectData) async {
    try {
      final response = await _client.patch(
        Uri.parse('$baseUrl/projects/$id'),
        headers: _headers,
        body: jsonEncode(projectData),
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to update project: ${e.toString()}');
    }
  }
  
  static Future<void> deleteProject(int id) async {
    try {
      final response = await _client.delete(
        Uri.parse('$baseUrl/projects/$id'),
        headers: _headers,
      );
      
      if (response.statusCode != 200) {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to delete project: ${e.toString()}');
    }
  }
  
  // Task methods
  static Future<List<dynamic>> getTasks() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/tasks'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get tasks: ${e.toString()}');
    }
  }
  
  static Future<List<dynamic>> getTasksByProject(int projectId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/projects/$projectId/tasks'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get tasks for project: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> getTask(int id) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/tasks/$id'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get task: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> createTask(Map<String, dynamic> taskData) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/tasks'),
        headers: _headers,
        body: jsonEncode(taskData),
      );
      
      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to create task: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> updateTask(int id, Map<String, dynamic> taskData) async {
    try {
      final response = await _client.patch(
        Uri.parse('$baseUrl/tasks/$id'),
        headers: _headers,
        body: jsonEncode(taskData),
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to update task: ${e.toString()}');
    }
  }
  
  static Future<Map<String, dynamic>> updateTaskStatus(int id, String status) async {
    try {
      final response = await _client.patch(
        Uri.parse('$baseUrl/tasks/$id/status'),
        headers: _headers,
        body: jsonEncode({'status': status}),
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to update task status: ${e.toString()}');
    }
  }
  
  static Future<void> deleteTask(int id) async {
    try {
      final response = await _client.delete(
        Uri.parse('$baseUrl/tasks/$id'),
        headers: _headers,
      );
      
      if (response.statusCode != 200) {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to delete task: ${e.toString()}');
    }
  }
  
  // Activity methods
  static Future<List<dynamic>> getRecentActivities() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/activities/recent'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get recent activities: ${e.toString()}');
    }
  }
  
  // Dashboard methods
  static Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/dashboard/stats'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get dashboard stats: ${e.toString()}');
    }
  }
  
  static Future<List<dynamic>> getTasksDueSoon() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/dashboard/due-soon'),
        headers: _headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = _parseErrorResponse(response);
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Failed to get tasks due soon: ${e.toString()}');
    }
  }
  
  // Helper method to parse error responses
  static String _parseErrorResponse(http.Response response) {
    try {
      final parsed = jsonDecode(response.body);
      return parsed['message'] ?? 'Unknown error';
    } catch (e) {
      return 'Server error (${response.statusCode})';
    }
  }
}