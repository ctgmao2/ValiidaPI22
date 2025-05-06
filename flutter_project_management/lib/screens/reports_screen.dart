import 'package:flutter/material.dart';
import 'package:project_management_app/models/project_model.dart';
import 'package:project_management_app/models/task_model.dart';
import 'package:project_management_app/services/api_service.dart';
import 'package:project_management_app/utils/date_formatter.dart';
import 'package:fl_chart/fl_chart.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<Project> _projects = [];
  List<Task> _tasks = [];
  Map<String, dynamic> _stats = {};
  String? _error;
  late TabController _tabController;
  
  // Filter options
  int? _projectFilter;
  DateTime? _startDateFilter;
  DateTime? _endDateFilter;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
  
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load dashboard stats
      final stats = await ApiService.getDashboardStats();
      
      // Load projects for filtering
      final projectsData = await ApiService.getProjects();
      final projects = projectsData
          .map((projectData) => Project.fromJson(projectData))
          .toList();
      
      // Load tasks
      final tasksData = await ApiService.getTasks();
      final tasks = tasksData
          .map((taskData) => Task.fromJson(taskData))
          .toList();
      
      if (mounted) {
        setState(() {
          _stats = stats;
          _projects = projects;
          _tasks = tasks;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load report data: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }
  
  List<Task> get _filteredTasks {
    return _tasks.where((task) {
      // Filter by project
      if (_projectFilter != null && task.projectId != _projectFilter) {
        return false;
      }
      
      // Filter by start date
      if (_startDateFilter != null) {
        if (task.startDate == null || task.startDate!.isBefore(_startDateFilter!)) {
          return false;
        }
      }
      
      // Filter by end date
      if (_endDateFilter != null) {
        if (task.dueDate == null || task.dueDate!.isAfter(_endDateFilter!)) {
          return false;
        }
      }
      
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        actions: [
          IconButton(
            onPressed: _loadData,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
          ),
          IconButton(
            onPressed: () {
              _showFilterDialog(context);
            },
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filter',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Summary'),
            Tab(text: 'Task Status'),
            Tab(text: 'Time Tracking'),
          ],
        ),
      ),
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
                        onPressed: _loadData,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    // Summary tab
                    _buildSummaryTab(context),
                    
                    // Task Status tab
                    _buildTaskStatusTab(context),
                    
                    // Time Tracking tab
                    _buildTimeTrackingTab(context),
                  ],
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showExportDialog(context);
        },
        child: const Icon(Icons.download),
      ),
    );
  }
  
  Widget _buildSummaryTab(BuildContext context) {
    final theme = Theme.of(context);
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Filter information
          if (_projectFilter != null || _startDateFilter != null || _endDateFilter != null)
            Card(
              elevation: 0,
              color: theme.colorScheme.secondary.withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Applied Filters',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (_projectFilter != null)
                          _buildFilterChip(
                            'Project: ${_projects.firstWhere((p) => p.id == _projectFilter).name}',
                            onRemove: () {
                              setState(() {
                                _projectFilter = null;
                              });
                            },
                          ),
                        if (_startDateFilter != null)
                          _buildFilterChip(
                            'From: ${DateFormatter.formatDate(_startDateFilter!, 'mm-dd-yyyy')}',
                            onRemove: () {
                              setState(() {
                                _startDateFilter = null;
                              });
                            },
                          ),
                        if (_endDateFilter != null)
                          _buildFilterChip(
                            'To: ${DateFormatter.formatDate(_endDateFilter!, 'mm-dd-yyyy')}',
                            onRemove: () {
                              setState(() {
                                _endDateFilter = null;
                              });
                            },
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextButton.icon(
                      onPressed: () {
                        setState(() {
                          _projectFilter = null;
                          _startDateFilter = null;
                          _endDateFilter = null;
                        });
                      },
                      icon: const Icon(Icons.clear_all),
                      label: const Text('Clear All Filters'),
                    ),
                  ],
                ),
              ),
            ),
            
          if (_projectFilter != null || _startDateFilter != null || _endDateFilter != null)
            const SizedBox(height: 16),
          
          // Stats cards
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
                _filteredTasks.length,
                Icons.task,
                theme.colorScheme.primary,
              ),
              _buildStatCard(
                context,
                'In Progress',
                _filteredTasks.where((t) => t.status == 'in-progress').length,
                Icons.pending_actions,
                Colors.blue,
              ),
              _buildStatCard(
                context,
                'Completed',
                _filteredTasks.where((t) => t.status == 'completed').length,
                Icons.check_circle,
                Colors.green,
              ),
              _buildStatCard(
                context,
                'Overdue',
                _filteredTasks.where((t) => 
                  t.status != 'completed' && 
                  t.dueDate != null && 
                  t.dueDate!.isBefore(DateTime.now())
                ).length,
                Icons.warning,
                Colors.orange,
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Task completion chart
          Card(
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
                    child: _buildTaskCompletionChart(context),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Task distribution by project
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tasks by Project',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 200,
                    child: _buildTasksByProjectChart(context),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Priority distribution
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tasks by Priority',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 200,
                    child: _buildTasksByPriorityChart(context),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTaskStatusTab(BuildContext context) {
    final theme = Theme.of(context);
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status breakdown card
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Task Status Breakdown',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildStatusBreakdownList(context),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Status trend chart
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Status Trend (Monthly)',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 300,
                    child: _buildStatusTrendChart(context),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTimeTrackingTab(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.timelapse,
            size: 64,
            color: theme.colorScheme.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text('Time tracking reports coming soon'),
        ],
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
    // Calculate values for pie chart
    final completed = _filteredTasks.where((t) => t.status == 'completed').length;
    final inProgress = _filteredTasks.where((t) => t.status == 'in-progress').length;
    final other = _filteredTasks.length - (completed + inProgress);
    
    return Row(
      children: [
        Expanded(
          child: PieChart(
            PieChartData(
              sections: [
                PieChartSectionData(
                  value: completed.toDouble(),
                  title: completed.toString(),
                  color: Colors.green,
                  radius: 80,
                  titleStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                PieChartSectionData(
                  value: inProgress.toDouble(),
                  title: inProgress.toString(),
                  color: Colors.blue,
                  radius: 80,
                  titleStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                PieChartSectionData(
                  value: other.toDouble(),
                  title: other.toString(),
                  color: Colors.grey,
                  radius: 80,
                  titleStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
              sectionsSpace: 0,
              centerSpaceRadius: 40,
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
            _buildLegendItem('Other', Colors.grey),
          ],
        ),
      ],
    );
  }
  
  Widget _buildTasksByProjectChart(BuildContext context) {
    // Group tasks by project
    final Map<int, int> taskCountByProject = {};
    
    for (final task in _filteredTasks) {
      if (taskCountByProject.containsKey(task.projectId)) {
        taskCountByProject[task.projectId] = taskCountByProject[task.projectId]! + 1;
      } else {
        taskCountByProject[task.projectId] = 1;
      }
    }
    
    // Sort projects by task count
    final sortedProjects = _projects
        .where((project) => taskCountByProject.containsKey(project.id))
        .toList()
          ..sort((a, b) => (taskCountByProject[b.id] ?? 0).compareTo(taskCountByProject[a.id] ?? 0));
    
    // Limit to top 5 projects
    final topProjects = sortedProjects.length > 5
        ? sortedProjects.sublist(0, 5)
        : sortedProjects;
    
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: (taskCountByProject.values.isEmpty ? 0 : taskCountByProject.values.reduce((a, b) => a > b ? a : b)).toDouble() * 1.2,
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value < 0 || value >= topProjects.length) {
                  return const SizedBox.shrink();
                }
                
                // Abbreviate long project names
                final projectName = topProjects[value.toInt()].name;
                final displayName = projectName.length > 10
                    ? '${projectName.substring(0, 8)}...'
                    : projectName;
                
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    displayName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 5,
              reservedSize: 30,
            ),
          ),
          topTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          rightTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
        ),
        borderData: FlBorderData(show: false),
        barGroups: List.generate(
          topProjects.length,
          (index) {
            final project = topProjects[index];
            final count = taskCountByProject[project.id] ?? 0;
            
            // Generate a color based on the project index
            final colors = [
              Colors.blue,
              Colors.green,
              Colors.orange,
              Colors.purple,
              Colors.red,
              Colors.teal,
            ];
            
            final color = colors[index % colors.length];
            
            return BarChartGroupData(
              x: index,
              barRods: [
                BarChartRodData(
                  toY: count.toDouble(),
                  color: color,
                  width: 20,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(6),
                    topRight: Radius.circular(6),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
  
  Widget _buildTasksByPriorityChart(BuildContext context) {
    // Count tasks by priority
    final highPriority = _filteredTasks.where((t) => t.priority == 'high').length;
    final mediumPriority = _filteredTasks.where((t) => t.priority == 'medium').length;
    final lowPriority = _filteredTasks.where((t) => t.priority == 'low').length;
    
    return Row(
      children: [
        Expanded(
          child: PieChart(
            PieChartData(
              sections: [
                PieChartSectionData(
                  value: highPriority.toDouble(),
                  title: highPriority.toString(),
                  color: Colors.red,
                  radius: 80,
                  titleStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                PieChartSectionData(
                  value: mediumPriority.toDouble(),
                  title: mediumPriority.toString(),
                  color: Colors.orange,
                  radius: 80,
                  titleStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                PieChartSectionData(
                  value: lowPriority.toDouble(),
                  title: lowPriority.toString(),
                  color: Colors.blue,
                  radius: 80,
                  titleStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
              sectionsSpace: 0,
              centerSpaceRadius: 40,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildLegendItem('High', Colors.red),
            const SizedBox(height: 8),
            _buildLegendItem('Medium', Colors.orange),
            const SizedBox(height: 8),
            _buildLegendItem('Low', Colors.blue),
          ],
        ),
      ],
    );
  }
  
  Widget _buildStatusBreakdownList(BuildContext context) {
    final theme = Theme.of(context);
    
    // Count tasks by status
    final Map<String, int> taskCountByStatus = {};
    final statuses = ['new', 'in-progress', 'review', 'completed', 'blocked'];
    
    for (final status in statuses) {
      taskCountByStatus[status] = _filteredTasks.where((t) => t.status == status).length;
    }
    
    return Column(
      children: statuses.map((status) {
        final count = taskCountByStatus[status] ?? 0;
        final total = _filteredTasks.isEmpty ? 1 : _filteredTasks.length;
        final percentage = (count / total) * 100;
        
        // Get color for status
        Color color;
        switch (status) {
          case 'new':
            color = Colors.grey;
            break;
          case 'in-progress':
            color = Colors.blue;
            break;
          case 'review':
            color = Colors.purple;
            break;
          case 'completed':
            color = Colors.green;
            break;
          case 'blocked':
            color = Colors.red;
            break;
          default:
            color = Colors.grey;
        }
        
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    status.replaceAll('-', ' ').toUpperCase(),
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '$count (${percentage.toStringAsFixed(1)}%)',
                    style: theme.textTheme.bodyMedium,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              LinearProgressIndicator(
                value: percentage / 100,
                backgroundColor: Colors.grey.withOpacity(0.2),
                valueColor: AlwaysStoppedAnimation<Color>(color),
                borderRadius: BorderRadius.circular(2),
                minHeight: 8,
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
  
  Widget _buildStatusTrendChart(BuildContext context) {
    // Placeholder for status trend chart
    // In a real implementation, this would show status changes over time
    return const Center(
      child: Text('Status trend data not available'),
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
  
  Widget _buildFilterChip(String label, {required VoidCallback onRemove}) {
    return Chip(
      label: Text(label),
      deleteIcon: const Icon(Icons.close, size: 18),
      onDeleted: onRemove,
    );
  }
  
  void _showFilterDialog(BuildContext context) {
    int? selectedProject = _projectFilter;
    DateTime? startDate = _startDateFilter;
    DateTime? endDate = _endDateFilter;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Reports'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Project filter
              const Text('Project'),
              const SizedBox(height: 8),
              DropdownButtonFormField<int?>(
                value: selectedProject,
                decoration: const InputDecoration(
                  labelText: 'Select Project',
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem<int?>(
                    value: null,
                    child: Text('All Projects'),
                  ),
                  ..._projects.map((project) => DropdownMenuItem(
                    value: project.id,
                    child: Text(project.name),
                  )),
                ],
                onChanged: (value) {
                  selectedProject = value;
                },
              ),
              
              const SizedBox(height: 16),
              
              // Date range filter
              const Text('Date Range'),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        final pickedDate = await showDatePicker(
                          context: context,
                          initialDate: startDate ?? DateTime.now(),
                          firstDate: DateTime(2020),
                          lastDate: DateTime(2030),
                        );
                        
                        if (pickedDate != null) {
                          startDate = pickedDate;
                        }
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'Start Date',
                          border: OutlineInputBorder(),
                        ),
                        child: Text(
                          startDate != null
                              ? DateFormatter.formatDate(startDate!, 'mm-dd-yyyy')
                              : 'Not set',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        final pickedDate = await showDatePicker(
                          context: context,
                          initialDate: endDate ?? DateTime.now(),
                          firstDate: DateTime(2020),
                          lastDate: DateTime(2030),
                        );
                        
                        if (pickedDate != null) {
                          endDate = pickedDate;
                        }
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'End Date',
                          border: OutlineInputBorder(),
                        ),
                        child: Text(
                          endDate != null
                              ? DateFormatter.formatDate(endDate!, 'mm-dd-yyyy')
                              : 'Not set',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Clear all filters
              Navigator.of(context).pop();
              setState(() {
                _projectFilter = null;
                _startDateFilter = null;
                _endDateFilter = null;
              });
            },
            child: const Text('Clear Filters'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              setState(() {
                _projectFilter = selectedProject;
                _startDateFilter = startDate;
                _endDateFilter = endDate;
              });
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }
  
  void _showExportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Export Report'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.picture_as_pdf),
              title: const Text('Export as PDF'),
              onTap: () {
                Navigator.of(context).pop();
                _exportReport('pdf');
              },
            ),
            ListTile(
              leading: const Icon(Icons.table_chart),
              title: const Text('Export as Excel'),
              onTap: () {
                Navigator.of(context).pop();
                _exportReport('excel');
              },
            ),
            ListTile(
              leading: const Icon(Icons.code),
              title: const Text('Export as CSV'),
              onTap: () {
                Navigator.of(context).pop();
                _exportReport('csv');
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }
  
  void _exportReport(String format) {
    // In a real app, this would generate and download the report
    // For now, just show a snackbar
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Exporting report as $format...'),
        action: SnackBarAction(
          label: 'Dismiss',
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }
}