import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:project_management_app/models/project_model.dart';
import 'package:project_management_app/models/task_model.dart';
import 'package:project_management_app/services/api_service.dart';
import 'package:project_management_app/utils/date_formatter.dart';
import 'package:project_management_app/widgets/task_card.dart';

class ProjectDetailsScreen extends StatefulWidget {
  final int projectId;
  
  const ProjectDetailsScreen({
    super.key,
    required this.projectId,
  });

  @override
  State<ProjectDetailsScreen> createState() => _ProjectDetailsScreenState();
}

class _ProjectDetailsScreenState extends State<ProjectDetailsScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  Project? _project;
  List<Task> _tasks = [];
  String? _error;
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
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
      // Load project details
      final projectData = await ApiService.getProject(widget.projectId);
      final project = Project.fromJson(projectData);
      
      // Load project tasks
      final tasksData = await ApiService.getTasksByProject(widget.projectId);
      final tasks = tasksData
          .map((taskData) => Task.fromJson(taskData))
          .toList();
      
      if (mounted) {
        setState(() {
          _project = project;
          _tasks = tasks;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load project details: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text(_project?.name ?? 'Project Details'),
        actions: [
          IconButton(
            onPressed: _loadData,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
          ),
          PopupMenuButton(
            icon: const Icon(Icons.more_vert),
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'edit',
                child: const Text('Edit Project'),
                onTap: () {
                  _showEditProjectDialog(context);
                },
              ),
              PopupMenuItem(
                value: 'delete',
                child: const Text('Delete Project'),
                onTap: () {
                  _showDeleteProjectDialog(context);
                },
              ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Tasks'),
            Tab(text: 'Team'),
            Tab(text: 'Wiki'),
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
                    // Overview tab
                    _buildOverviewTab(context),
                    
                    // Tasks tab
                    _buildTasksTab(context),
                    
                    // Team tab
                    _buildTeamTab(context),
                    
                    // Wiki tab
                    _buildWikiTab(context),
                  ],
                ),
      floatingActionButton: _buildFloatingActionButton(context),
    );
  }
  
  Widget _buildOverviewTab(BuildContext context) {
    final theme = Theme.of(context);
    
    if (_project == null) {
      return const Center(child: Text('Project not found'));
    }
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Project status card
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Status',
                        style: theme.textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      _buildStatusChip(_project!.status),
                    ],
                  ),
                  const Spacer(),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Progress',
                        style: theme.textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      _buildProgressIndicator(),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Project description
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Description',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _project!.description ?? 'No description provided',
                    style: theme.textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Project timeline
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Timeline',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Start Date',
                              style: theme.textTheme.titleSmall,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _project!.startDate != null
                                  ? DateFormatter.formatDate(
                                      _project!.startDate!,
                                      'mm-dd-yyyy',
                                    )
                                  : 'Not set',
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'End Date',
                              style: theme.textTheme.titleSmall,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _project!.endDate != null
                                  ? DateFormatter.formatDate(
                                      _project!.endDate!,
                                      'mm-dd-yyyy',
                                    )
                                  : 'Not set',
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Task stats card
          Card(
            elevation: 0,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tasks',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _buildTaskStatItem(
                        context,
                        'Total',
                        _project!.tasksCount ?? 0,
                        Colors.blue,
                      ),
                      _buildTaskStatItem(
                        context,
                        'In Progress',
                        _project!.inProgressCount ?? 0,
                        Colors.orange,
                      ),
                      _buildTaskStatItem(
                        context,
                        'Completed',
                        _project!.completedCount ?? 0,
                        Colors.green,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTasksTab(BuildContext context) {
    final theme = Theme.of(context);
    
    if (_tasks.isEmpty) {
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
            const Text('No tasks in this project'),
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
    
    return ListView.separated(
      padding: const EdgeInsets.all(16.0),
      itemCount: _tasks.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final task = _tasks[index];
        return TaskCard(
          task: task,
          onTap: () {
            context.go('/tasks/${task.id}');
          },
        );
      },
    );
  }
  
  Widget _buildTeamTab(BuildContext context) {
    return const Center(
      child: Text('Team members will be displayed here'),
    );
  }
  
  Widget _buildWikiTab(BuildContext context) {
    return const Center(
      child: Text('Project documentation will be displayed here'),
    );
  }
  
  Widget? _buildFloatingActionButton(BuildContext context) {
    // Different FAB based on current tab
    if (_tabController.index == 1) { // Tasks tab
      return FloatingActionButton(
        onPressed: () {
          _showCreateTaskDialog(context);
        },
        child: const Icon(Icons.add),
      );
    }
    
    return null;
  }
  
  Widget _buildStatusChip(String status) {
    Color color;
    
    switch (status) {
      case 'active':
        color = Colors.green;
        break;
      case 'on-hold':
        color = Colors.orange;
        break;
      case 'completed':
        color = Colors.blue;
        break;
      case 'archived':
        color = Colors.grey;
        break;
      default:
        color = Colors.grey;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color,
          width: 1,
        ),
      ),
      child: Text(
        status.replaceAll('-', ' ').toUpperCase(),
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
  
  Widget _buildProgressIndicator() {
    final total = _project?.tasksCount ?? 0;
    final completed = _project?.completedCount ?? 0;
    
    double progress = total > 0 ? completed / total : 0.0;
    
    return Row(
      children: [
        SizedBox(
          width: 100,
          child: LinearProgressIndicator(
            value: progress,
            borderRadius: BorderRadius.circular(4),
            minHeight: 8,
            backgroundColor: Colors.grey.withOpacity(0.2),
          ),
        ),
        const SizedBox(width: 8),
        Text('${(progress * 100).toInt()}%'),
      ],
    );
  }
  
  Widget _buildTaskStatItem(
    BuildContext context,
    String label,
    int count,
    Color color,
  ) {
    return Expanded(
      child: Column(
        children: [
          Text(
            count.toString(),
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: color.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }
  
  void _showEditProjectDialog(BuildContext context) {
    if (_project == null) return;
    
    final formKey = GlobalKey<FormState>();
    final nameController = TextEditingController(text: _project!.name);
    final descriptionController = TextEditingController(text: _project!.description);
    String status = _project!.status;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Project'),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Project Name',
                    prefixIcon: Icon(Icons.folder_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a project name';
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
                  items: const [
                    DropdownMenuItem(
                      value: 'active',
                      child: Text('Active'),
                    ),
                    DropdownMenuItem(
                      value: 'on-hold',
                      child: Text('On Hold'),
                    ),
                    DropdownMenuItem(
                      value: 'completed',
                      child: Text('Completed'),
                    ),
                    DropdownMenuItem(
                      value: 'archived',
                      child: Text('Archived'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      status = value;
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
                  await ApiService.updateProject(widget.projectId, {
                    'name': nameController.text,
                    'description': descriptionController.text,
                    'status': status,
                  });
                  
                  // Reload project data
                  await _loadData();
                } catch (e) {
                  setState(() {
                    _error = 'Failed to update project: ${e.toString()}';
                    _isLoading = false;
                  });
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
  
  void _showDeleteProjectDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Project'),
        content: const Text(
          'Are you sure you want to delete this project? This action cannot be undone and will also delete all tasks associated with this project.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.of(context).pop();
              
              // Show loading indicator
              setState(() {
                _isLoading = true;
              });
              
              try {
                await ApiService.deleteProject(widget.projectId);
                
                // Navigate back to projects list
                if (context.mounted) {
                  context.go('/projects');
                }
              } catch (e) {
                setState(() {
                  _error = 'Failed to delete project: ${e.toString()}';
                  _isLoading = false;
                });
              }
            },
            child: const Text('Delete'),
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
                  items: const [
                    DropdownMenuItem(
                      value: 'new',
                      child: Text('New'),
                    ),
                    DropdownMenuItem(
                      value: 'in-progress',
                      child: Text('In Progress'),
                    ),
                    DropdownMenuItem(
                      value: 'review',
                      child: Text('Review'),
                    ),
                    DropdownMenuItem(
                      value: 'completed',
                      child: Text('Completed'),
                    ),
                  ],
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
                  items: const [
                    DropdownMenuItem(
                      value: 'low',
                      child: Text('Low'),
                    ),
                    DropdownMenuItem(
                      value: 'medium',
                      child: Text('Medium'),
                    ),
                    DropdownMenuItem(
                      value: 'high',
                      child: Text('High'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      priority = value;
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
                    'projectId': widget.projectId,
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