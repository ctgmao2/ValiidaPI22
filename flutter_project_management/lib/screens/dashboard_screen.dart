import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/models/task_model.dart';
import 'package:project_management_app/models/activity_model.dart';
import 'package:project_management_app/providers/auth_provider.dart';
import 'package:project_management_app/providers/accessibility_provider.dart';
import 'package:project_management_app/services/api_service.dart';
import 'package:project_management_app/utils/date_formatter.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic> _stats = {};
  List<Task> _tasksDueSoon = [];
  List<Activity> _recentActivities = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load dashboard stats
      final stats = await ApiService.getDashboardStats();
      
      // Load tasks due soon
      final tasksDueSoonData = await ApiService.getTasksDueSoon();
      final tasksDueSoon = tasksDueSoonData
          .map((taskData) => Task.fromJson(taskData))
          .toList();
      
      // Load recent activities
      final activitiesData = await ApiService.getRecentActivities();
      final activities = activitiesData
          .map((activityData) => Activity.fromJson(activityData))
          .toList();
      
      if (mounted) {
        setState(() {
          _stats = stats;
          _tasksDueSoon = tasksDueSoon;
          _recentActivities = activities;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load dashboard data: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    
    final user = authProvider.currentUser;
    
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Error',
                        style: theme.textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(_error!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadDashboardData,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadDashboardData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Welcome message
                        Text(
                          'Welcome back, ${user?.fullName.split(' ').first ?? 'User'}!',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Here\'s what\'s happening with your projects',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: theme.colorScheme.onBackground.withOpacity(0.7),
                          ),
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Task stats cards
                        GridView.count(
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          children: [
                            _buildStatCard(
                              context,
                              'Total Tasks',
                              _stats['total'] ?? 0,
                              Icons.task,
                              theme.colorScheme.primary,
                            ),
                            _buildStatCard(
                              context,
                              'In Progress',
                              _stats['inProgress'] ?? 0,
                              Icons.pending_actions,
                              Colors.blue,
                            ),
                            _buildStatCard(
                              context,
                              'Completed',
                              _stats['completed'] ?? 0,
                              Icons.check_circle,
                              Colors.green,
                            ),
                            _buildStatCard(
                              context,
                              'Overdue',
                              _stats['overdue'] ?? 0,
                              Icons.warning,
                              Colors.orange,
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Task completion chart
                        _buildTaskCompletionChart(context),
                        
                        const SizedBox(height: 24),
                        
                        // Tasks due soon
                        _buildTasksDueSoon(context),
                        
                        const SizedBox(height: 24),
                        
                        // Recent activities
                        _buildRecentActivities(context),
                      ],
                    ),
                  ),
                ),
    );
  }
  
  Widget _buildStatCard(
    BuildContext context,
    String title,
    int value,
    IconData icon,
    Color color,
  ) {
    final theme = Theme.of(context);
    
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  icon,
                  color: color,
                  size: 24,
                ),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: theme.textTheme.titleMedium,
                ),
              ],
            ),
            const Spacer(),
            Text(
              value.toString(),
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTaskCompletionChart(BuildContext context) {
    final theme = Theme.of(context);
    
    // Calculate percentages
    final total = _stats['total'] ?? 0;
    final completed = _stats['completed'] ?? 0;
    final inProgress = _stats['inProgress'] ?? 0;
    final other = total - (completed + inProgress);
    
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Task Completion',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 200,
              child: Row(
                children: [
                  Expanded(
                    child: PieChart(
                      PieChartData(
                        sections: [
                          PieChartSectionData(
                            value: completed.toDouble(),
                            title: '${total > 0 ? ((completed / total) * 100).toStringAsFixed(0) : 0}%',
                            color: Colors.green,
                            radius: 60,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          PieChartSectionData(
                            value: inProgress.toDouble(),
                            title: '${total > 0 ? ((inProgress / total) * 100).toStringAsFixed(0) : 0}%',
                            color: Colors.blue,
                            radius: 60,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          PieChartSectionData(
                            value: other.toDouble(),
                            title: '${total > 0 ? ((other / total) * 100).toStringAsFixed(0) : 0}%',
                            color: Colors.grey,
                            radius: 60,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                        sectionsSpace: 0,
                        centerSpaceRadius: 0,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLegendItem('Completed', Colors.green),
                      const SizedBox(height: 8),
                      _buildLegendItem('In Progress', Colors.blue),
                      const SizedBox(height: 8),
                      _buildLegendItem('New/Other', Colors.grey),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(label),
      ],
    );
  }
  
  Widget _buildTasksDueSoon(BuildContext context) {
    final theme = Theme.of(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Tasks Due Soon',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    context.go('/tasks');
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _tasksDueSoon.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 24.0),
                      child: Text('No tasks due soon'),
                    ),
                  )
                : ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _tasksDueSoon.length > 5 ? 5 : _tasksDueSoon.length,
                    separatorBuilder: (context, index) => const Divider(),
                    itemBuilder: (context, index) {
                      final task = _tasksDueSoon[index];
                      
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          task.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Text(
                          DateFormatter.getDaysRemaining(task.dueDate),
                          style: TextStyle(
                            color: task.dueDate != null && task.dueDate!.isBefore(DateTime.now())
                                ? theme.colorScheme.error
                                : null,
                          ),
                        ),
                        trailing: ElevatedButton(
                          onPressed: () {
                            context.go('/tasks/${task.id}');
                          },
                          child: const Text('View'),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildRecentActivities(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Activities',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _recentActivities.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 24.0),
                      child: Text('No recent activities'),
                    ),
                  )
                : ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _recentActivities.length > 5 ? 5 : _recentActivities.length,
                    separatorBuilder: (context, index) => const Divider(),
                    itemBuilder: (context, index) {
                      final activity = _recentActivities[index];
                      
                      IconData activityIcon;
                      Color iconColor;
                      
                      // Set icon and color based on activity type
                      if (activity.type.contains('task')) {
                        activityIcon = Icons.task;
                        iconColor = theme.colorScheme.primary;
                      } else if (activity.type.contains('project')) {
                        activityIcon = Icons.folder;
                        iconColor = Colors.green;
                      } else {
                        activityIcon = Icons.person;
                        iconColor = Colors.blue;
                      }
                      
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: iconColor.withOpacity(0.2),
                          child: Icon(
                            activityIcon,
                            color: iconColor,
                          ),
                        ),
                        title: Text(
                          activity.description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Text(
                          DateFormatter.formatRelativeDate(activity.createdAt),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }
}