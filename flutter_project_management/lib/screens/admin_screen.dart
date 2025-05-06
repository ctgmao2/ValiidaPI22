import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/models/user_model.dart';
import 'package:project_management_app/providers/auth_provider.dart';
import 'package:project_management_app/services/api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<User> _users = [];
  String? _error;
  late TabController _tabController;
  
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
      // Load users
      final usersData = await ApiService.getUsers();
      final users = usersData
          .map((userData) => User.fromJson(userData))
          .toList();
      
      if (mounted) {
        setState(() {
          _users = users;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load users: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    
    // Check if user has admin role
    final isAdmin = authProvider.currentUser?.role == 'admin';
    
    if (!isAdmin) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Administration'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.admin_panel_settings,
                size: 64,
                color: theme.colorScheme.primary.withOpacity(0.5),
              ),
              const SizedBox(height: 16),
              const Text('Access Denied'),
              const SizedBox(height: 8),
              const Text('You need administrator privileges to access this page.'),
            ],
          ),
        ),
      );
    }
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Administration'),
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
            Tab(text: 'Users'),
            Tab(text: 'Settings'),
            Tab(text: 'Logs'),
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
                    // Users tab
                    _buildUsersTab(context),
                    
                    // Settings tab
                    _buildSettingsTab(context),
                    
                    // Logs tab
                    _buildLogsTab(context),
                  ],
                ),
      floatingActionButton: _tabController.index == 0
          ? FloatingActionButton(
              onPressed: () {
                _showCreateUserDialog(context);
              },
              child: const Icon(Icons.add),
            )
          : null,
    );
  }
  
  Widget _buildUsersTab(BuildContext context) {
    final theme = Theme.of(context);
    
    if (_users.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outlined,
              size: 64,
              color: theme.colorScheme.primary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            const Text('No users found'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                _showCreateUserDialog(context);
              },
              icon: const Icon(Icons.add),
              label: const Text('Create User'),
            ),
          ],
        ),
      );
    }
    
    // User search field
    final searchController = TextEditingController();
    
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: TextField(
            controller: searchController,
            decoration: InputDecoration(
              labelText: 'Search Users',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onChanged: (value) {
              // Filter users
            },
          ),
        ),
        Expanded(
          child: ListView.builder(
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
                trailing: PopupMenuButton(
                  icon: const Icon(Icons.more_vert),
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'edit',
                      child: const Text('Edit User'),
                      onTap: () {
                        _showEditUserDialog(context, user);
                      },
                    ),
                    PopupMenuItem(
                      value: 'delete',
                      child: const Text('Delete User'),
                      onTap: () {
                        _showDeleteUserDialog(context, user);
                      },
                    ),
                  ],
                ),
                onTap: () {
                  _showUserDetailsBottomSheet(context, user);
                },
              );
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildSettingsTab(BuildContext context) {
    final theme = Theme.of(context);
    
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        // General settings section
        Card(
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'General Settings',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('Allow User Registration'),
                  subtitle: const Text('Enable public user registration'),
                  value: false,
                  onChanged: (value) {
                    // Update setting
                  },
                ),
                const Divider(),
                SwitchListTile(
                  title: const Text('Email Notifications'),
                  subtitle: const Text('Send email notifications for task updates'),
                  value: true,
                  onChanged: (value) {
                    // Update setting
                  },
                ),
                const Divider(),
                ListTile(
                  title: const Text('Default User Role'),
                  subtitle: const Text('Role assigned to new users'),
                  trailing: DropdownButton<String>(
                    value: 'user',
                    items: const [
                      DropdownMenuItem(
                        value: 'user',
                        child: Text('Regular User'),
                      ),
                      DropdownMenuItem(
                        value: 'manager',
                        child: Text('Manager'),
                      ),
                    ],
                    onChanged: (value) {
                      // Update setting
                    },
                    underline: Container(),
                  ),
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 16),
        
        // Security settings section
        Card(
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Security Settings',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('Two-Factor Authentication'),
                  subtitle: const Text('Require 2FA for all users'),
                  value: false,
                  onChanged: (value) {
                    // Update setting
                  },
                ),
                const Divider(),
                ListTile(
                  title: const Text('Session Timeout'),
                  subtitle: const Text('Automatically log out inactive users'),
                  trailing: DropdownButton<String>(
                    value: '30m',
                    items: const [
                      DropdownMenuItem(
                        value: '15m',
                        child: Text('15 minutes'),
                      ),
                      DropdownMenuItem(
                        value: '30m',
                        child: Text('30 minutes'),
                      ),
                      DropdownMenuItem(
                        value: '1h',
                        child: Text('1 hour'),
                      ),
                      DropdownMenuItem(
                        value: '2h',
                        child: Text('2 hours'),
                      ),
                    ],
                    onChanged: (value) {
                      // Update setting
                    },
                    underline: Container(),
                  ),
                ),
                const Divider(),
                ListTile(
                  title: const Text('Password Policy'),
                  subtitle: const Text('Minimum password requirements'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    // Show password policy settings
                  },
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 16),
        
        // System settings section
        Card(
          elevation: 0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'System Settings',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  title: const Text('Backup Database'),
                  subtitle: const Text('Create a backup of the system database'),
                  trailing: ElevatedButton(
                    onPressed: () {
                      // Backup database
                    },
                    child: const Text('Backup'),
                  ),
                ),
                const Divider(),
                ListTile(
                  title: const Text('Clear Cache'),
                  subtitle: const Text('Clear system cache to free up space'),
                  trailing: OutlinedButton(
                    onPressed: () {
                      // Clear cache
                    },
                    child: const Text('Clear'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildLogsTab(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.list_alt,
            size: 64,
            color: theme.colorScheme.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text('System logs will be displayed here'),
        ],
      ),
    );
  }
  
  void _showCreateUserDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final usernameController = TextEditingController();
    final passwordController = TextEditingController();
    final fullNameController = TextEditingController();
    final emailController = TextEditingController();
    String role = 'user';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create User'),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: usernameController,
                  decoration: const InputDecoration(
                    labelText: 'Username',
                    prefixIcon: Icon(Icons.person_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a username';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: passwordController,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock_outlined),
                  ),
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a password';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: fullNameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.badge_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter the full name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value != null && value.isNotEmpty && !value.contains('@')) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: role,
                  decoration: const InputDecoration(
                    labelText: 'Role',
                    prefixIcon: Icon(Icons.assignment_ind_outlined),
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'user',
                      child: Text('User'),
                    ),
                    DropdownMenuItem(
                      value: 'manager',
                      child: Text('Manager'),
                    ),
                    DropdownMenuItem(
                      value: 'admin',
                      child: Text('Administrator'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      role = value;
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
                  await ApiService.createUser({
                    'username': usernameController.text,
                    'password': passwordController.text,
                    'fullName': fullNameController.text,
                    'email': emailController.text,
                    'role': role,
                  });
                  
                  // Reload users
                  await _loadData();
                } catch (e) {
                  setState(() {
                    _error = 'Failed to create user: ${e.toString()}';
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
  
  void _showEditUserDialog(BuildContext context, User user) {
    final formKey = GlobalKey<FormState>();
    final fullNameController = TextEditingController(text: user.fullName);
    final emailController = TextEditingController(text: user.email);
    String role = user.role ?? 'user';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit User'),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: fullNameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.badge_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter the full name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value != null && value.isNotEmpty && !value.contains('@')) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: role,
                  decoration: const InputDecoration(
                    labelText: 'Role',
                    prefixIcon: Icon(Icons.assignment_ind_outlined),
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'user',
                      child: Text('User'),
                    ),
                    DropdownMenuItem(
                      value: 'manager',
                      child: Text('Manager'),
                    ),
                    DropdownMenuItem(
                      value: 'admin',
                      child: Text('Administrator'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      role = value;
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
                  await ApiService.updateUser(user.id, {
                    'fullName': fullNameController.text,
                    'email': emailController.text,
                    'role': role,
                  });
                  
                  // Reload users
                  await _loadData();
                } catch (e) {
                  setState(() {
                    _error = 'Failed to update user: ${e.toString()}';
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
  
  void _showDeleteUserDialog(BuildContext context, User user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete User'),
        content: Text(
          'Are you sure you want to delete the user "${user.fullName}"? This action cannot be undone.',
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
                await ApiService.deleteUser(user.id);
                
                // Reload users
                await _loadData();
              } catch (e) {
                setState(() {
                  _error = 'Failed to delete user: ${e.toString()}';
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
  
  void _showUserDetailsBottomSheet(BuildContext context, User user) {
    final theme = Theme.of(context);
    
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
              style: theme.textTheme.titleLarge,
            ),
            Text(
              '@${user.username}',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onBackground.withOpacity(0.7),
              ),
            ),
            if (user.email != null) ...[
              const SizedBox(height: 8),
              Text(
                user.email!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onBackground.withOpacity(0.7),
                ),
              ),
            ],
            const SizedBox(height: 8),
            Chip(
              label: Text(
                user.role?.toUpperCase() ?? 'USER',
                style: TextStyle(
                  color: _getRoleColor(user.role),
                  fontWeight: FontWeight.bold,
                ),
              ),
              backgroundColor: _getRoleColor(user.role).withOpacity(0.1),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                    _showEditUserDialog(context, user);
                  },
                  icon: const Icon(Icons.edit),
                  label: const Text('Edit User'),
                ),
                const SizedBox(width: 16),
                OutlinedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                    _showResetPasswordDialog(context, user);
                  },
                  icon: const Icon(Icons.lock_reset),
                  label: const Text('Reset Password'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  void _showResetPasswordDialog(BuildContext context, User user) {
    final formKey = GlobalKey<FormState>();
    final passwordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Reset Password for ${user.fullName}'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: passwordController,
                decoration: const InputDecoration(
                  labelText: 'New Password',
                  prefixIcon: Icon(Icons.lock_outlined),
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a new password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: confirmPasswordController,
                decoration: const InputDecoration(
                  labelText: 'Confirm New Password',
                  prefixIcon: Icon(Icons.lock_outlined),
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please confirm the new password';
                  }
                  if (value != passwordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
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
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                Navigator.of(context).pop();
                
                // Show loading indicator
                setState(() {
                  _isLoading = true;
                });
                
                try {
                  await ApiService.updateUser(user.id, {
                    'password': passwordController.text,
                  });
                  
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Password reset successfully'),
                      ),
                    );
                  }
                  
                  // Don't need to reload users as the password change doesn't affect the UI
                  setState(() {
                    _isLoading = false;
                  });
                } catch (e) {
                  setState(() {
                    _error = 'Failed to reset password: ${e.toString()}';
                    _isLoading = false;
                  });
                }
              }
            },
            child: const Text('Reset Password'),
          ),
        ],
      ),
    );
  }
  
  Color _getRoleColor(String? role) {
    switch (role) {
      case 'admin':
        return Colors.purple;
      case 'manager':
        return Colors.blue;
      case 'user':
      default:
        return Colors.green;
    }
  }
}