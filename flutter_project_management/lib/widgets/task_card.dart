import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/models/task_model.dart';
import 'package:project_management_app/utils/date_formatter.dart';
import 'package:project_management_app/providers/accessibility_provider.dart';
import 'package:project_management_app/widgets/status_badge.dart';

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback onTap;
  final bool compact;
  
  const TaskCard({
    super.key,
    required this.task,
    required this.onTap,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    
    // Priority color
    Color priorityColor;
    switch (task.priority) {
      case 'high':
        priorityColor = Colors.red;
        break;
      case 'medium':
        priorityColor = Colors.orange;
        break;
      case 'low':
        priorityColor = Colors.blue;
        break;
      default:
        priorityColor = Colors.grey;
    }
    
    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: EdgeInsets.all(compact ? 12 : 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Task title and priority
              Row(
                children: [
                  // Priority indicator
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: priorityColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  
                  // Task title
                  Expanded(
                    child: Text(
                      task.title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  
                  // Status badge
                  StatusBadge(status: task.status),
                ],
              ),
              
              if (!compact) ...[
                const SizedBox(height: 8),
                
                // Description
                if (task.description != null && task.description!.isNotEmpty)
                  Text(
                    task.description!,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onBackground.withOpacity(0.7),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                
                const SizedBox(height: 16),
                
                // Task details row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Project info
                    if (task.projectName != null) 
                      _buildDetailItem(
                        context,
                        Icons.folder_outlined,
                        task.projectName!,
                      ),
                    
                    // Due date
                    if (task.dueDate != null)
                      _buildDetailItem(
                        context,
                        Icons.calendar_today_outlined,
                        DateFormatter.formatDate(
                          task.dueDate!,
                          accessibilityProvider.dateFormat,
                        ),
                        isOverdue: task.dueDate!.isBefore(DateTime.now()) && task.status != 'completed',
                      ),
                    
                    // Assignee
                    if (task.assigneeName != null)
                      _buildDetailItem(
                        context,
                        Icons.person_outline,
                        task.assigneeName!,
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildDetailItem(
    BuildContext context,
    IconData icon,
    String text, {
    bool isOverdue = false,
  }) {
    final theme = Theme.of(context);
    
    Color textColor = theme.colorScheme.onBackground.withOpacity(0.7);
    if (isOverdue) {
      textColor = theme.colorScheme.error;
    }
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: textColor,
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: theme.textTheme.bodySmall?.copyWith(
            color: textColor,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}