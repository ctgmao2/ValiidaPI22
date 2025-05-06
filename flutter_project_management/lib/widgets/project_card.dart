import 'package:flutter/material.dart';
import 'package:project_management_app/models/project_model.dart';
import 'package:project_management_app/utils/date_formatter.dart';

class ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback onTap;
  final bool mini;
  
  const ProjectCard({
    super.key,
    required this.project,
    required this.onTap,
    this.mini = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    Color statusColor;
    IconData statusIcon;
    
    // Set status color and icon
    switch (project.status) {
      case 'active':
        statusColor = Colors.green;
        statusIcon = Icons.play_arrow;
        break;
      case 'on-hold':
        statusColor = Colors.orange;
        statusIcon = Icons.pause;
        break;
      case 'completed':
        statusColor = Colors.blue;
        statusIcon = Icons.check_circle;
        break;
      case 'archived':
        statusColor = Colors.grey;
        statusIcon = Icons.archive;
        break;
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.help_outline;
    }
    
    return Card(
      elevation: 0,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status indicator and project name
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8.0,
                      vertical: 4.0,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          statusIcon,
                          size: 14,
                          color: statusColor,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          project.status,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: statusColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.more_vert),
                    iconSize: 18,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () {
                      // Show project actions menu
                    },
                  ),
                ],
              ),
              
              if (!mini) const SizedBox(height: 12),
              
              // Project name
              Text(
                project.name,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              
              if (!mini) ...[
                const SizedBox(height: 8),
                
                // Project description
                if (project.description != null && project.description!.isNotEmpty)
                  Text(
                    project.description!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onBackground.withOpacity(0.7),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                
                const Spacer(),
                
                // Project metrics
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildMetric(
                      context,
                      Icons.task_outlined,
                      project.tasksCount?.toString() ?? '0',
                      'Tasks',
                    ),
                    _buildMetric(
                      context,
                      Icons.pending_outlined,
                      project.inProgressCount?.toString() ?? '0',
                      'In Progress',
                    ),
                    _buildMetric(
                      context,
                      Icons.check_outlined,
                      project.completedCount?.toString() ?? '0',
                      'Completed',
                    ),
                  ],
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildMetric(
    BuildContext context,
    IconData icon,
    String value,
    String label,
  ) {
    final theme = Theme.of(context);
    
    return Column(
      children: [
        Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(width: 4),
            Text(
              value,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onBackground.withOpacity(0.7),
          ),
        ),
      ],
    );
  }
}