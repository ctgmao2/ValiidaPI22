import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/models/task_model.dart';
import 'package:project_management_app/models/project_model.dart';
import 'package:project_management_app/services/api_service.dart';
import 'package:project_management_app/providers/accessibility_provider.dart';
import 'package:project_management_app/utils/date_formatter.dart';
import 'package:project_management_app/widgets/task_card.dart';
import 'package:project_management_app/widgets/gantt_chart.dart';
import 'package:project_management_app/widgets/task_calendar.dart';
import 'package:project_management_app/widgets/status_badge.dart';

class TasksScreen extends StatefulWidget {
  final int? projectId;
  
  const TasksScreen({
    super.key,
    this.projectId,
  });

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<Task> _tasks = [];
  List<Project> _projects = [];
  String? _error;
  
  // Filters
  String _searchQuery = '';
  String _statusFilter = 'all';
  int? _projectFilter;
  String _priorityFilter = 'all';
  String _assigneeFilter = 'all';
  
  // View options
  late TabController _tabController;
  int _currentView = 0; // 0 = list, 1 = gantt, 2 = calendar
  
  @override
  void initState() {
    super.initState();
    _projectFilter = widget.projectId;
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      setState(() {
        _currentView = _tabController.index;
      });
    });
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
      // Load tasks
      final tasksData = widget.projectId != null
          ? await ApiService.getTasksByProject(widget.projectId!)
          : await ApiService.getTasks();
      
      final tasks = tasksData
          .map((taskData) => Task.fromJson(taskData))
          .toList();
      
      // Load projects for filtering
      final projectsData = await ApiService.getProjects();
      final projects = projectsData
          .map((projectData) => Project.fromJson(projectData))
          .toList();
      
      if (mounted) {
        setState(() {
          _tasks = tasks;
          _projects = projects;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load tasks: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }
  
  List<Task> get _filteredTasks {
    return _tasks.where((task) {
      // Apply search filter
      final matchesSearch = _searchQuery.isEmpty ||
          task.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (task.description?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      
      // Apply status filter
      final matchesStatus = _statusFilter == 'all' || task.status == _statusFilter;
      
      // Apply project filter
      final matchesProject = _projectFilter == null || task.projectId == _projectFilter;
      
      // Apply priority filter
      final matchesPriority = _priorityFilter == 'all' || task.priority == _priorityFilter;
      
      // Apply assignee filter
      final matchesAssignee = _assigneeFilter == 'all' || 
          (task.assigneeId != null ? task.assigneeId.toString() == _assigneeFilter : _assigneeFilter == 'unassigned');
      
      return matchesSearch && matchesStatus && matchesProject && matchesPriority && matchesAssignee;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.projectId != null ? 'Project Tasks' : 'All Tasks'),
        actions: [
          IconButton(
            onPressed: _loadData,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(
              icon: Icon(Icons.list),
              text: 'List',
            ),
            Tab(
              icon: Icon(Icons.stacked_bar_chart),
              text: 'Gantt',
            ),
            Tab(
              icon: Icon(Icons.calendar_month),
              text: 'Calendar',
            ),
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
              : Column(
                  children: [
                    // Filters
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          // Search
                          TextField(
                            decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.search),
                              hintText: 'Search tasks...',
                              border: OutlineInputBorder(),
                            ),
                            onChanged: (value) {
                              setState(() {
                                _searchQuery = value;
                              });
                            },
                          ),
                          
                          const SizedBox(height: 16),
                          
                          // Filter chips
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                // Status filter
                                DropdownButton<String>(
                                  value: _statusFilter,
                                  icon: const Icon(Icons.filter_list),
                                  underline: Container(),
                                  items: [
                                    const DropdownMenuItem(
                                      value: 'all',
                                      child: Text('All Statuses'),
                                    ),
                                    ...TaskStatus.values.map((status) => DropdownMenuItem(
                                      value: status,
                                      child: Row(
                                        children: [
                                          StatusBadge(status: status),
                                          const SizedBox(width: 8),
                                          Text(status),
                                        ],
                                      ),
                                    )),
                                  ],
                                  onChanged: (value) {
                                    if (value != null) {
                                      setState(() {
                                        _statusFilter = value;
                                      });
                                    }
                                  },
                                ),
                                
                                const SizedBox(width: 16),
                                
                                // Project filter
                                if (widget.projectId == null)
                                  DropdownButton<int?>(
                                    value: _projectFilter,
                                    icon: const Icon(Icons.filter_list),
                                    underline: Container(),
                                    items: [
                                      const DropdownMenuItem(
                                        value: null,
                                        child: Text('All Projects'),
                                      ),
                                      ..._projects.map((project) => DropdownMenuItem(
                                        value: project.id,
                                        child: Row(
                                          children: [
                                            const Icon(Icons.folder, size: 16),
                                            const SizedBox(width: 8),
                                            Text(project.name),
                                          ],
                                        ),
                                      )),
                                    ],
                                    onChanged: (value) {
                                      setState(() {
                                        _projectFilter = value;
                                      });
                                    },
                                  ),
                                
                                if (widget.projectId == null) const SizedBox(width: 16),
                                
                                // Priority filter
                                DropdownButton<String>(
                                  value: _priorityFilter,
                                  icon: const Icon(Icons.filter_list),
                                  underline: Container(),
                                  items: [
                                    const DropdownMenuItem(
                                      value: 'all',
                                      child: Text('All Priorities'),
                                    ),
                                    ...TaskPriority.values.map((priority) => DropdownMenuItem(
                                      value: priority,
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.flag,
                                            size: 16,
                                            color: priority == 'high'
                                                ? Colors.red
                                                : priority == 'medium'
                                                    ? Colors.orange
                                                    : Colors.blue,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(priority),
                                        ],
                                      ),
                                    )),
                                  ],
                                  onChanged: (value) {
                                    if (value != null) {
                                      setState(() {
                                        _priorityFilter = value;
                                      });
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // Task views
                    Expanded(
                      child: TabBarView(
                        controller: _tabController,
                        children: [
                          // List view
                          _buildListView(),
                          
                          // Gantt chart view
                          _buildGanttView(),
                          
                          // Calendar view
                          _buildCalendarView(),
                        ],
                      ),
                    ),
                  ],
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showCreateTaskDialog(context);
        },
        child: const Icon(Icons.add),
      ),
    );
  }
  
  Widget _buildListView() {
    final tasks = _filteredTasks;
    
    return tasks.isEmpty
        ? _buildEmptyView()
        : RefreshIndicator(
            onRefresh: _loadData,
            child: ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: tasks.length,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final task = tasks[index];
                return TaskCard(
                  task: task,
                  onTap: () {
                    context.go('/tasks/${task.id}');
                  },
                );
              },
            ),
          );
  }
  
  Widget _buildGanttView() {
    final tasks = _filteredTasks;
    
    return tasks.isEmpty
        ? _buildEmptyView()
        : GanttChart(
            tasks: tasks,
            startDate: DateTime.now().subtract(const Duration(days: 30)),
            endDate: DateTime.now().add(const Duration(days: 150)),
            onTaskTap: (task) {
              context.go('/tasks/${task.id}');
            },
          );
  }
  
  Widget _buildCalendarView() {
    final tasks = _filteredTasks;
    
    return tasks.isEmpty
        ? _buildEmptyView()
        : TaskCalendar(
            tasks: tasks,
            onTaskTap: (task) {
              context.go('/tasks/${task.id}');
            },
          );
  }
  
  Widget _buildEmptyView() {
    final theme = Theme.of(context);
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.task_outlined,
            size: 64,
            color: theme.colorScheme.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text('No tasks found'),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              _showCreateTaskDialog(context);
            },
            icon: const Icon(Icons.add),
            label: const Text('Create Task'),
          ),
        ],
      ),
    );
  }
  
  void _showCreateTaskDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    String status = 'new';
    String priority = 'medium';
    int? projectId = _projectFilter;
    DateTime? dueDate;
    
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context, listen: false);
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Task'),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Task Title',
                    prefixIcon: Icon(Icons.task_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a task title';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: descriptionController,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    prefixIcon: Icon(Icons.description_outlined),
                  ),
                  maxLines: 3,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: status,
                  decoration: const InputDecoration(
                    labelText: 'Status',
                    prefixIcon: Icon(Icons.flag_outlined),
                  ),
                  items: TaskStatus.values.map((status) => DropdownMenuItem(
                    value: status,
                    child: Row(
                      children: [
                        StatusBadge(status: status),
                        const SizedBox(width: 8),
                        Text(status),
                      ],
                    ),
                  )).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      status = value;
                    }
                  },
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: priority,
                  decoration: const InputDecoration(
                    labelText: 'Priority',
                    prefixIcon: Icon(Icons.priority_high_outlined),
                  ),
                  items: TaskPriority.values.map((priority) => DropdownMenuItem(
                    value: priority,
                    child: Row(
                      children: [
                        Icon(
                          Icons.flag,
                          size: 16,
                          color: priority == 'high'
                              ? Colors.red
                              : priority == 'medium'
                                  ? Colors.orange
                                  : Colors.blue,
                        ),
                        const SizedBox(width: 8),
                        Text(priority),
                      ],
                    ),
                  )).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      priority = value;
                    }
                  },
                ),
                const SizedBox(height: 16),
                // Project dropdown if not in project context
                if (widget.projectId == null)
                  DropdownButtonFormField<int?>(
                    value: projectId,
                    decoration: const InputDecoration(
                      labelText: 'Project',
                      prefixIcon: Icon(Icons.folder_outlined),
                    ),
                    items: _projects.map((project) => DropdownMenuItem(
                      value: project.id,
                      child: Text(project.name),
                    )).toList(),
                    validator: (value) {
                      if (value == null) {
                        return 'Please select a project';
                      }
                      return null;
                    },
                    onChanged: (value) {
                      projectId = value;
                    },
                  ),
                if (widget.projectId == null) const SizedBox(height: 16),
                // Due date picker
                ListTile(
                  leading: const Icon(Icons.calendar_today),
                  title: Text(dueDate == null
                      ? 'Set Due Date'
                      : 'Due: ${DateFormatter.formatDate(dueDate!, accessibilityProvider.dateFormat)}'),
                  onTap: () async {
                    final selectedDate = await showDatePicker(
                      context: context,
                      initialDate: dueDate ?? DateTime.now().add(const Duration(days: 7)),
                      firstDate: DateTime.now().subtract(const Duration(days: 365)),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    
                    if (selectedDate != null) {
                      dueDate = selectedDate;
                      // Force dialog to rebuild
                      Navigator.of(context).pop();
                      _showCreateTaskDialog(context);
                    }
                  },
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                Navigator.of(context).pop();
                
                // Show loading indicator
                setState(() {
                  _isLoading = true;
                });
                
                try {
                  await ApiService.createTask({
                    'title': titleController.text,
                    'description': descriptionController.text,
                    'status': status,
                    'priority': priority,
                    'projectId': projectId ?? widget.projectId,
                    'dueDate': dueDate?.toIso8601String(),
                  });
                  
                  // Reload tasks
                  await _loadData();
                } catch (e) {
                  setState(() {
                    _error = 'Failed to create task: ${e.toString()}';
                    _isLoading = false;
                  });
                }
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
}

class TaskStatus {
  static const String new_ = 'new';
  static const String inProgress = 'in-progress';
  static const String review = 'review';
  static const String completed = 'completed';
  static const String blocked = 'blocked';
  
  static const List<String> values = [
    new_,
    inProgress,
    review,
    completed,
    blocked,
  ];
}

class TaskPriority {
  static const String low = 'low';
  static const String medium = 'medium';
  static const String high = 'high';
  
  static const List<String> values = [
    low,
    medium,
    high,
  ];
}