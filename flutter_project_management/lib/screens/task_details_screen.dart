import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/models/task_model.dart';
import 'package:project_management_app/models/user_model.dart';
import 'package:project_management_app/services/api_service.dart';
import 'package:project_management_app/providers/accessibility_provider.dart';
import 'package:project_management_app/utils/date_formatter.dart';
import 'package:project_management_app/widgets/status_badge.dart';

class TaskDetailsScreen extends StatefulWidget {
  final int taskId;
  
  const TaskDetailsScreen({
    super.key,
    required this.taskId,
  });

  @override
  State<TaskDetailsScreen> createState() => _TaskDetailsScreenState();
}

class _TaskDetailsScreenState extends State<TaskDetailsScreen> {
  bool _isLoading = true;
  Task? _task;
  List<User> _users = [];
  String? _error;
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load task details
      final taskData = await ApiService.getTask(widget.taskId);
      final task = Task.fromJson(taskData);
      
      // Load users for assignment
      final usersData = await ApiService.getUsers();
      final users = usersData
          .map((userData) => User.fromJson(userData))
          .toList();
      
      if (mounted) {
        setState(() {
          _task = task;
          _users = users;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load task details: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text(_task?.title ?? 'Task Details'),
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
                child: const Text('Edit Task'),
                onTap: () {
                  _showEditTaskDialog(context);
                },
              ),
              PopupMenuItem(
                value: 'delete',
                child: const Text('Delete Task'),
                onTap: () {
                  _showDeleteTaskDialog(context);
                },
              ),
            ],
          ),
        ],
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
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Task header with status and buttons
                      Row(
                        children: [
                          Expanded(
                            child: StatusBadge(status: _task!.status),
                          ),
                          _buildStatusChangeButton(context),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Task title and description
                      Text(
                        _task!.title,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      
                      if (_task!.description != null && _task!.description!.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Text(
                          _task!.description!,
                          style: theme.textTheme.bodyLarge,
                        ),
                      ],
                      
                      const SizedBox(height: 24),
                      
                      // Task details card
                      Card(
                        elevation: 0,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Details',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 16),
                              _buildDetailRow(
                                context,
                                'Project',
                                _task!.projectName ?? 'Unknown',
                                Icons.folder_outlined,
                                onTap: _task!.projectId != null
                                    ? () => context.go('/projects/${_task!.projectId}')
                                    : null,
                              ),
                              const Divider(),
                              _buildDetailRow(
                                context,
                                'Priority',
                                _task!.priority,
                                _getPriorityIcon(_task!.priority),
                                color: _getPriorityColor(_task!.priority),
                              ),
                              const Divider(),
                              _buildDetailRow(
                                context,
                                'Assigned To',
                                _task!.assigneeName ?? 'Unassigned',
                                Icons.person_outlined,
                                onTap: _task!.assigneeId != null
                                    ? () => _showUserDetailsBottomSheet(context, _task!.assigneeId!)
                                    : () => _showAssignTaskDialog(context),
                              ),
                              const Divider(),
                              _buildDetailRow(
                                context,
                                'Due Date',
                                _task!.dueDate != null
                                    ? DateFormatter.formatDate(
                                        _task!.dueDate!,
                                        accessibilityProvider.dateFormat,
                                      )
                                    : 'Not set',
                                Icons.calendar_today_outlined,
                                color: _task!.dueDate != null &&
                                        _task!.dueDate!.isBefore(DateTime.now()) &&
                                        _task!.status != 'completed'
                                    ? Colors.red
                                    : null,
                              ),
                              if (_task!.startDate != null) ...[
                                const Divider(),
                                _buildDetailRow(
                                  context,
                                  'Start Date',
                                  DateFormatter.formatDate(
                                    _task!.startDate!,
                                    accessibilityProvider.dateFormat,
                                  ),
                                  Icons.play_arrow_outlined,
                                ),
                              ],
                              if (_task!.completedAt != null) ...[
                                const Divider(),
                                _buildDetailRow(
                                  context,
                                  'Completed Date',
                                  DateFormatter.formatDate(
                                    _task!.completedAt!,
                                    accessibilityProvider.dateFormat,
                                  ),
                                  Icons.check_circle_outline,
                                  color: Colors.green,
                                ),
                              ],
                              if (_task!.estimatedHours != null) ...[
                                const Divider(),
                                _buildDetailRow(
                                  context,
                                  'Estimated Hours',
                                  '${_task!.estimatedHours} hours',
                                  Icons.timer_outlined,
                                ),
                              ],
                              if (_task!.actualHours != null) ...[
                                const Divider(),
                                _buildDetailRow(
                                  context,
                                  'Actual Hours',
                                  '${_task!.actualHours} hours',
                                  Icons.history_outlined,
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Dependencies section
                      if (_task!.dependsOn != null && _task!.dependsOn!.isNotEmpty) ...[
                        Text(
                          'Dependencies',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildDependenciesList(context),
                        const SizedBox(height: 24),
                      ],
                      
                      // Comments section placeholder
                      Text(
                        'Comments',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Card(
                        elevation: 0,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: _buildCommentsSection(context),
                        ),
                      ),
                      
                      // Activity section placeholder
                      const SizedBox(height: 24),
                      Text(
                        'Activity',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Card(
                        elevation: 0,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: _buildActivitySection(context),
                        ),
                      ),
                      
                      // Bottom padding
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
    );
  }
  
  Widget _buildStatusChangeButton(BuildContext context) {
    if (_task == null) return const SizedBox.shrink();
    
    return PopupMenuButton<String>(
      child: Chip(
        label: const Text('Change Status'),
        avatar: const Icon(Icons.swap_horiz, size: 18),
      ),
      itemBuilder: (context) {
        return [
          // New status
          PopupMenuItem<String>(
            value: 'new',
            enabled: _task!.status != 'new',
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Text('New'),
              ],
            ),
          ),
          
          // In Progress status
          PopupMenuItem<String>(
            value: 'in-progress',
            enabled: _task!.status != 'in-progress',
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Text('In Progress'),
              ],
            ),
          ),
          
          // Review status
          PopupMenuItem<String>(
            value: 'review',
            enabled: _task!.status != 'review',
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.purple,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Text('Review'),
              ],
            ),
          ),
          
          // Completed status
          PopupMenuItem<String>(
            value: 'completed',
            enabled: _task!.status != 'completed',
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Text('Completed'),
              ],
            ),
          ),
          
          // Blocked status
          PopupMenuItem<String>(
            value: 'blocked',
            enabled: _task!.status != 'blocked',
            child: Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Text('Blocked'),
              ],
            ),
          ),
        ];
      },
      onSelected: (String status) async {
        setState(() {
          _isLoading = true;
        });
        
        try {
          await ApiService.updateTaskStatus(widget.taskId, status);
          await _loadData();
        } catch (e) {
          setState(() {
            _error = 'Failed to update task status: ${e.toString()}';
            _isLoading = false;
          });
        }
      },
    );
  }
  
  Widget _buildDetailRow(
    BuildContext context,
    String label,
    String value,
    IconData icon, {
    VoidCallback? onTap,
    Color? color,
  }) {
    final theme = Theme.of(context);
    final effectiveColor = color ?? theme.colorScheme.onSurface;
    
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: effectiveColor.withOpacity(0.7),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: effectiveColor,
                    ),
                  ),
                ],
              ),
            ),
            if (onTap != null)
              Icon(
                Icons.chevron_right,
                size: 20,
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildDependenciesList(BuildContext context) {
    return const Center(
      child: Text('Task dependencies will be displayed here'),
    );
  }
  
  Widget _buildCommentsSection(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Comment form
        TextField(
          decoration: InputDecoration(
            hintText: 'Add a comment...',
            suffixIcon: IconButton(
              icon: const Icon(Icons.send),
              onPressed: () {
                // Add comment functionality
              },
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          maxLines: 3,
          minLines: 1,
        ),
        
        const SizedBox(height: 16),
        
        // Comments list placeholder
        Center(
          child: Text(
            'No comments yet',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.5),
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildActivitySection(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Text(
        'Task activity will be displayed here',
        style: theme.textTheme.bodyMedium?.copyWith(
          color: theme.colorScheme.onSurface.withOpacity(0.5),
        ),
      ),
    );
  }
  
  IconData _getPriorityIcon(String priority) {
    switch (priority) {
      case 'high':
        return Icons.priority_high;
      case 'medium':
        return Icons.remove;
      case 'low':
        return Icons.arrow_downward;
      default:
        return Icons.remove;
    }
  }
  
  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      case 'low':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
  
  void _showEditTaskDialog(BuildContext context) {
    if (_task == null) return;
    
    final formKey = GlobalKey<FormState>();
    final titleController = TextEditingController(text: _task!.title);
    final descriptionController = TextEditingController(text: _task!.description);
    String status = _task!.status;
    String priority = _task!.priority;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Task'),
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
                    DropdownMenuItem(
                      value: 'blocked',
                      child: Text('Blocked'),
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
                  await ApiService.updateTask(widget.taskId, {
                    'title': titleController.text,
                    'description': descriptionController.text,
                    'status': status,
                    'priority': priority,
                  });
                  
                  // Reload task data
                  await _loadData();
                } catch (e) {
                  setState(() {
                    _error = 'Failed to update task: ${e.toString()}';
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
  
  void _showDeleteTaskDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Task'),
        content: const Text(
          'Are you sure you want to delete this task? This action cannot be undone.',
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
                await ApiService.deleteTask(widget.taskId);
                
                // Navigate back to tasks list or project
                if (context.mounted) {
                  if (_task?.projectId != null) {
                    context.go('/projects/${_task!.projectId}');
                  } else {
                    context.go('/tasks');
                  }
                }
              } catch (e) {
                setState(() {
                  _error = 'Failed to delete task: ${e.toString()}';
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
  
  void _showAssignTaskDialog(BuildContext context) {
    if (_task == null) return;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Assign Task'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: _users.length,
            itemBuilder: (context, index) {
              final user = _users[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: Color(int.parse(
                    user.avatarColor.replaceAll('#', '0xff'),
                  )),
                  child: Text(
                    user.initials,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                title: Text(user.fullName),
                subtitle: Text(user.username),
                onTap: () async {
                  Navigator.of(context).pop();
                  
                  // Show loading indicator
                  setState(() {
                    _isLoading = true;
                  });
                  
                  try {
                    await ApiService.updateTask(widget.taskId, {
                      'assigneeId': user.id,
                    });
                    
                    // Reload task data
                    await _loadData();
                  } catch (e) {
                    setState(() {
                      _error = 'Failed to assign task: ${e.toString()}';
                      _isLoading = false;
                    });
                  }
                },
              );
            },
          ),
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
  
  void _showUserDetailsBottomSheet(BuildContext context, int userId) {
    final user = _users.firstWhere(
      (user) => user.id == userId,
      orElse: () => User(
        id: 0,
        username: 'unknown',
        fullName: 'Unknown User',
        avatarColor: '#808080',
        initials: 'UN',
      ),
    );
    
    showModalBottomSheet(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: Color(int.parse(
                user.avatarColor.replaceAll('#', '0xff'),
              )),
              child: Text(
                user.initials,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 24,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              user.fullName,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              '@${user.username}',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
              ),
            ),
            if (user.email != null) ...[
              const SizedBox(height: 8),
              Text(
                user.email!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                ),
              ),
            ],
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    // View user profile
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.person),
                  label: const Text('View Profile'),
                ),
                const SizedBox(width: 16),
                OutlinedButton.icon(
                  onPressed: () {
                    // Unassign task
                    Navigator.of(context).pop();
                    _unassignTask(context);
                  },
                  icon: const Icon(Icons.person_remove),
                  label: const Text('Unassign'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Future<void> _unassignTask(BuildContext context) async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      await ApiService.updateTask(widget.taskId, {
        'assigneeId': null,
      });
      
      // Reload task data
      await _loadData();
    } catch (e) {
      setState(() {
        _error = 'Failed to unassign task: ${e.toString()}';
        _isLoading = false;
      });
    }
  }
}