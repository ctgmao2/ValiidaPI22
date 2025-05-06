import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool small;
  
  const StatusBadge({
    super.key,
    required this.status,
    this.small = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    // Define color and icon based on status
    Color color;
    IconData icon;
    String label = status;
    
    // Set status color and icon
    switch (status) {
      case 'new':
        color = Colors.grey;
        icon = Icons.fiber_new;
        break;
      case 'in-progress':
        color = Colors.blue;
        icon = Icons.pending;
        label = 'In Progress';
        break;
      case 'review':
        color = Colors.purple;
        icon = Icons.find_in_page;
        break;
      case 'completed':
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case 'blocked':
        color = Colors.red;
        icon = Icons.block;
        break;
      case 'active':
        color = Colors.green;
        icon = Icons.play_arrow;
        break;
      case 'on-hold':
        color = Colors.orange;
        icon = Icons.pause;
        label = 'On Hold';
        break;
      case 'archived':
        color = Colors.grey;
        icon = Icons.archive;
        break;
      default:
        color = Colors.grey;
        icon = Icons.help_outline;
    }
    
    // For improved accessibility/colorblindness, we capitalize the first letter
    final displayLabel = label.substring(0, 1).toUpperCase() + label.substring(1);
    
    // Small badge is just a colored dot for compact displays
    if (small) {
      return Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
      );
    }
    
    // Regular badge includes label and icon
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8.0,
        vertical: 4.0,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            displayLabel,
            style: theme.textTheme.bodySmall?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}