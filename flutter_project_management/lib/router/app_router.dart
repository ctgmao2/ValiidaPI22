import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/providers/auth_provider.dart';
import 'package:project_management_app/screens/login_screen.dart';
import 'package:project_management_app/screens/dashboard_screen.dart';
import 'package:project_management_app/screens/projects_screen.dart';
import 'package:project_management_app/screens/project_details_screen.dart';
import 'package:project_management_app/screens/tasks_screen.dart';
import 'package:project_management_app/screens/task_details_screen.dart';
import 'package:project_management_app/screens/reports_screen.dart';
import 'package:project_management_app/screens/team_screen.dart';
import 'package:project_management_app/screens/profile_screen.dart';
import 'package:project_management_app/screens/admin_screen.dart';
import 'package:project_management_app/screens/settings_screen.dart';
import 'package:project_management_app/screens/not_found_screen.dart';
import 'package:project_management_app/widgets/app_shell.dart';

class AppRouter {
  static GoRouter createRouter(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    return GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final isLoggedIn = authProvider.isAuthenticated;
        final isLoggingIn = state.matchedLocation == '/login';
        
        // If the user is not logged in and not on the login page, redirect to login
        if (!isLoggedIn && !isLoggingIn) {
          return '/login';
        }
        
        // If the user is logged in and on the login page, redirect to dashboard
        if (isLoggedIn && isLoggingIn) {
          return '/dashboard';
        }
        
        // Otherwise, no redirect is necessary
        return null;
      },
      errorBuilder: (context, state) {
        return const NotFoundScreen();
      },
      routes: [
        // Login route
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        
        // Main app shell with protected routes
        ShellRoute(
          builder: (context, state, child) {
            return AppShell(child: child);
          },
          routes: [
            // Dashboard
            GoRoute(
              path: '/dashboard',
              builder: (context, state) => const DashboardScreen(),
            ),
            
            // Projects
            GoRoute(
              path: '/projects',
              builder: (context, state) => const ProjectsScreen(),
              routes: [
                GoRoute(
                  path: ':id',
                  builder: (context, state) {
                    final projectId = int.parse(state.pathParameters['id']!);
                    return ProjectDetailsScreen(projectId: projectId);
                  },
                  routes: [
                    GoRoute(
                      path: 'tasks',
                      builder: (context, state) {
                        final projectId = int.parse(state.pathParameters['id']!);
                        return TasksScreen(projectId: projectId);
                      },
                    ),
                  ],
                ),
              ],
            ),
            
            // Tasks
            GoRoute(
              path: '/tasks',
              builder: (context, state) => const TasksScreen(),
              routes: [
                GoRoute(
                  path: ':id',
                  builder: (context, state) {
                    final taskId = int.parse(state.pathParameters['id']!);
                    return TaskDetailsScreen(taskId: taskId);
                  },
                ),
              ],
            ),
            
            // Reports
            GoRoute(
              path: '/reports',
              builder: (context, state) => const ReportsScreen(),
            ),
            
            // Team
            GoRoute(
              path: '/team',
              builder: (context, state) => const TeamScreen(),
            ),
            
            // Admin
            GoRoute(
              path: '/admin',
              builder: (context, state) => const AdminScreen(),
            ),
            
            // Profile
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfileScreen(),
            ),
            
            // Settings
            GoRoute(
              path: '/settings',
              builder: (context, state) => const SettingsScreen(),
            ),
          ],
        ),
      ],
    );
  }
}

// Route names for navigation
class AppRoutes {
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String projects = '/projects';
  static const String project = '/projects/:id';
  static const String projectTasks = '/projects/:id/tasks';
  static const String tasks = '/tasks';
  static const String task = '/tasks/:id';
  static const String reports = '/reports';
  static const String team = '/team';
  static const String admin = '/admin';
  static const String profile = '/profile';
  static const String settings = '/settings';
}