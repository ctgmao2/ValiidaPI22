import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:project_management_app/models/project_model.dart';
import 'package:project_management_app/services/api_service.dart';
import 'package:project_management_app/utils/date_formatter.dart';
import 'package:project_management_app/widgets/project_card.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  bool _isLoading = true;
  List<Project> _projects = [];
  String? _error;
  String _searchQuery = '';
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final projectsData = await ApiService.getProjects();
      final projects = projectsData
          .map((projectData) => Project.fromJson(projectData))
          .toList();
      
      if (mounted) {
        setState(() {
          _projects = projects;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load projects: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  List<Project> get _filteredProjects {
    return _projects.where((project) {
      // Apply search filter
      final matchesSearch = _searchQuery.isEmpty ||
          project.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (project.description?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      
      // Apply status filter
      final matchesStatus = _statusFilter == 'all' || project.status == _statusFilter;
      
      return matchesSearch && matchesStatus;
    }).toList();
  }

  // Organize projects into a hierarchical structure
  List<Map<String, dynamic>> _organizeProjects() {
    final Map<int, Map<String, dynamic>> projectMap = {};
    final List<Map<String, dynamic>> rootProjects = [];
    
    // First pass: create map entry for each project
    for (final project in _filteredProjects) {
      projectMap[project.id] = {
        'project': project,
        'subprojects': <Map<String, dynamic>>[],
      };
    }
    
    // Second pass: organize into parent-child relationships
    for (final project in _filteredProjects) {
      // This would require a parent field in the Project model
      // For simplicity, treating all projects as top-level for now
      rootProjects.add(projectMap[project.id]!);
    }
    
    return rootProjects;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final organizedProjects = _organizeProjects();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Projects'),
        actions: [
          IconButton(
            onPressed: _loadProjects,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
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
                        onPressed: _loadProjects,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Search and filter
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              decoration: const InputDecoration(
                                prefixIcon: Icon(Icons.search),
                                hintText: 'Search projects...',
                                border: OutlineInputBorder(),
                              ),
                              onChanged: (value) {
                                setState(() {
                                  _searchQuery = value;
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          DropdownButton<String>(
                            value: _statusFilter,
                            items: const [
                              DropdownMenuItem(
                                value: 'all',
                                child: Text('All Statuses'),
                              ),
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
                                setState(() {
                                  _statusFilter = value;
                                });
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                    
                    // Projects grid
                    Expanded(
                      child: organizedProjects.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.folder_off,
                                    size: 64,
                                    color: theme.colorScheme.primary.withOpacity(0.5),
                                  ),
                                  const SizedBox(height: 16),
                                  const Text('No projects found'),
                                  const SizedBox(height: 16),
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      // Open create project dialog
                                      _showCreateProjectDialog(context);
                                    },
                                    icon: const Icon(Icons.add),
                                    label: const Text('Create Project'),
                                  ),
                                ],
                              ),
                            )
                          : RefreshIndicator(
                              onRefresh: _loadProjects,
                              child: GridView.builder(
                                padding: const EdgeInsets.all(16.0),
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  childAspectRatio: 1.3,
                                  crossAxisSpacing: 16,
                                  mainAxisSpacing: 16,
                                ),
                                itemCount: organizedProjects.length + 1, // +1 for create project button
                                itemBuilder: (context, index) {
                                  if (index == organizedProjects.length) {
                                    // Create project card
                                    return _buildCreateProjectCard(context);
                                  }
                                  
                                  final projectData = organizedProjects[index];
                                  final project = projectData['project'] as Project;
                                  final subprojects = projectData['subprojects'] as List<Map<String, dynamic>>;
                                  
                                  return ProjectCard(
                                    project: project,
                                    onTap: () {
                                      context.go('/projects/${project.id}');
                                    },
                                  );
                                },
                              ),
                            ),
                    ),
                  ],
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showCreateProjectDialog(context);
        },
        child: const Icon(Icons.add),
      ),
    );
  }
  
  Widget _buildCreateProjectCard(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      elevation: 0,
      child: InkWell(
        onTap: () {
          _showCreateProjectDialog(context);
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.add_box,
              size: 48,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Create Project',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  void _showCreateProjectDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    String status = 'active';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Project'),
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
                  await ApiService.createProject({
                    'name': nameController.text,
                    'description': descriptionController.text,
                    'status': status,
                  });
                  
                  // Reload projects
                  await _loadProjects();
                } catch (e) {
                  setState(() {
                    _error = 'Failed to create project: ${e.toString()}';
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