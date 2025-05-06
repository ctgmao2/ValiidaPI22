import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:project_management_app/providers/auth_provider.dart';
import 'package:provider/provider.dart';

// Screens
import 'package:project_management_app/screens/login_screen.dart';
import 'package:project_management_app/screens/dashboard_screen.dart';
import 'package:project_management_app/screens/projects_screen.dart';
import 'package:project_management_app/screens/project_details_screen.dart';
import 'package:project_management_app/screens/project_manage_screen.dart';
import 'package:project_management_app/screens/project_tasks_screen.dart';
import 'package:project_management_app/screens/project_wiki_screen.dart';
import 'package:project_management_app/screens/project_time_screen.dart';
import 'package:project_management_app/screens/tasks_screen.dart';
import 'package:project_management_app/screens/admin_screen.dart';
import 'package:project_management_app/screens/reports_screen.dart';
import 'package:project_management_app/screens/not_found_screen.dart';

class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _shellNavigatorKey = GlobalKey<NavigatorState>();
  
  static final GoRouter router = GoRouter(
    initialLocation: '/dashboard',
    navigatorKey: _rootNavigatorKey,
    redirect: (BuildContext context, GoRouterState state) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final bool loggedIn = authProvider.isAuthenticated;
      final bool loggingIn = state.matchedLocation == '/login';
      
      // If not logged in, redirect to login unless already going there
      if (!loggedIn && !loggingIn) {
        return '/login';
      }
      
      // If logged in and on login page, redirect to dashboard
      if (loggedIn && loggingIn) {
        return '/dashboard';
      }
      
      // No redirect needed
      return null;
    },
    routes: [
      // Login route
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      
      // Application shell with bottom navigation
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          // We'll implement a layout wrapper here that includes navigation
          return Scaffold(
            body: child,
            // The actual navigation bar will be implemented in a separate component
          );
        },
        routes: [
          // Dashboard route
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          
          // Projects route
          GoRoute(
            path: '/projects',
            builder: (context, state) => const ProjectsScreen(),
          ),
          
          // Project details with tabs
          GoRoute(
            path: '/projects/:id',
            builder: (context, state) {
              final projectId = int.parse(state.pathParameters['id']!);
              return ProjectDetailsScreen(projectId: projectId);
            },
            routes: [
              // Project management tab
              GoRoute(
                path: 'manage',
                builder: (context, state) {
                  final projectId = int.parse(state.pathParameters['id']!);
                  return ProjectManageScreen(projectId: projectId);
                },
              ),
              
              // Project tasks tab
              GoRoute(
                path: 'tasks',
                builder: (context, state) {
                  final projectId = int.parse(state.pathParameters['id']!);
                  return ProjectTasksScreen(projectId: projectId);
                },
              ),
              
              // Project wiki tab
              GoRoute(
                path: 'wiki',
                builder: (context, state) {
                  final projectId = int.parse(state.pathParameters['id']!);
                  return ProjectWikiScreen(projectId: projectId);
                },
              ),
              
              // Project time tracking tab
              GoRoute(
                path: 'time',
                builder: (context, state) {
                  final projectId = int.parse(state.pathParameters['id']!);
                  return ProjectTimeScreen(projectId: projectId);
                },
              ),
            ],
          ),
          
          // Tasks route
          GoRoute(
            path: '/tasks',
            builder: (context, state) => const TasksScreen(),
          ),
          
          // Admin route
          GoRoute(
            path: '/admin',
            builder: (context, state) => const AdminScreen(),
          ),
          
          // Reports route
          GoRoute(
            path: '/reports',
            builder: (context, state) => const ReportsScreen(),
          ),
        ],
      ),
      
      // 404 Not Found route
      GoRoute(
        path: '/404',
        builder: (context, state) => const NotFoundScreen(),
      ),
    ],
    
    // Redirect to 404 for unmatched routes
    errorBuilder: (context, state) => const NotFoundScreen(),
  );
}