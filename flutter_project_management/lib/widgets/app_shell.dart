import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/providers/auth_provider.dart';
import 'package:project_management_app/providers/accessibility_provider.dart';

class AppShell extends StatefulWidget {
  final Widget child;
  
  const AppShell({
    super.key,
    required this.child,
  });

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    
    // Get current route to highlight the correct nav item
    final String location = GoRouterState.of(context).matchedLocation;
    
    if (location.startsWith('/dashboard')) {
      _currentIndex = 0;
    } else if (location.startsWith('/projects')) {
      _currentIndex = 1;
    } else if (location.startsWith('/tasks')) {
      _currentIndex = 2;
    } else if (location.startsWith('/reports')) {
      _currentIndex = 3;
    } else if (location.startsWith('/admin')) {
      _currentIndex = 4;
    }
    
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(
              Icons.task_alt,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(width: 12),
            Text(
              'Project Management',
              style: TextStyle(
                color: theme.colorScheme.onSurface,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          // Accessibility button
          IconButton(
            icon: const Icon(Icons.accessibility_new),
            onPressed: () {
              accessibilityProvider.toggleAccessibilityPanel();
            },
            tooltip: 'Accessibility Options',
          ),
          
          // User profile menu
          if (authProvider.currentUser != null)
            PopupMenuButton(
              offset: const Offset(0, 40),
              icon: CircleAvatar(
                backgroundColor: Color(int.parse(
                  authProvider.currentUser!.avatarColor.replaceAll('#', '0xff'),
                )),
                child: Text(
                  authProvider.currentUser!.initials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              itemBuilder: (context) => [
                PopupMenuItem(
                  child: Row(
                    children: [
                      const Icon(Icons.person),
                      const SizedBox(width: 8),
                      const Text('Profile'),
                    ],
                  ),
                  onTap: () {
                    // Open profile screen
                  },
                ),
                PopupMenuItem(
                  child: Row(
                    children: [
                      const Icon(Icons.settings),
                      const SizedBox(width: 8),
                      const Text('Settings'),
                    ],
                  ),
                  onTap: () {
                    // Open settings screen
                  },
                ),
                const PopupMenuDivider(),
                PopupMenuItem(
                  child: Row(
                    children: [
                      const Icon(Icons.logout),
                      const SizedBox(width: 8),
                      const Text('Logout'),
                    ],
                  ),
                  onTap: () async {
                    // Log out
                    await authProvider.logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                ),
              ],
            ),
        ],
      ),
      body: Stack(
        children: [
          // Main content
          widget.child,
          
          // Accessibility panel
          if (accessibilityProvider.isAccessibilityPanelOpen)
            Positioned(
              top: 0,
              right: 0,
              child: Card(
                margin: const EdgeInsets.all(16),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Accessibility Options',
                            style: theme.textTheme.titleMedium,
                          ),
                          IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () {
                              accessibilityProvider.toggleAccessibilityPanel();
                            },
                            constraints: const BoxConstraints(),
                            padding: EdgeInsets.zero,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SwitchListTile(
                        title: const Text('High Contrast'),
                        value: accessibilityProvider.isHighContrast,
                        onChanged: (value) {
                          accessibilityProvider.toggleHighContrast();
                        },
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                      ),
                      SwitchListTile(
                        title: const Text('Large Text'),
                        value: accessibilityProvider.isLargeText,
                        onChanged: (value) {
                          accessibilityProvider.toggleLargeText();
                        },
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                      ),
                      SwitchListTile(
                        title: const Text('Screen Reader'),
                        value: accessibilityProvider.isReadAloud,
                        onChanged: (value) {
                          accessibilityProvider.toggleReadAloud();
                        },
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                      ),
                      const SizedBox(height: 8),
                      const Text('Date Format:'),
                      const SizedBox(height: 8),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(
                            value: 'mm-dd-yyyy',
                            label: Text('MM-DD-YYYY'),
                          ),
                          ButtonSegment(
                            value: 'dd-mm-yyyy',
                            label: Text('DD-MM-YYYY'),
                          ),
                        ],
                        selected: {accessibilityProvider.dateFormat},
                        onSelectionChanged: (value) {
                          accessibilityProvider.setDateFormat(value.first);
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (int index) {
          setState(() {
            _currentIndex = index;
          });
          
          switch (index) {
            case 0:
              context.go('/dashboard');
              break;
            case 1:
              context.go('/projects');
              break;
            case 2:
              context.go('/tasks');
              break;
            case 3:
              context.go('/reports');
              break;
            case 4:
              context.go('/admin');
              break;
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.folder_outlined),
            selectedIcon: Icon(Icons.folder),
            label: 'Projects',
          ),
          NavigationDestination(
            icon: Icon(Icons.task_outlined),
            selectedIcon: Icon(Icons.task),
            label: 'Tasks',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart),
            label: 'Reports',
          ),
          NavigationDestination(
            icon: Icon(Icons.admin_panel_settings_outlined),
            selectedIcon: Icon(Icons.admin_panel_settings),
            label: 'Admin',
          ),
        ],
      ),
    );
  }
}