import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:project_management_app/models/task_model.dart';
import 'package:project_management_app/utils/date_formatter.dart';
import 'package:project_management_app/widgets/status_badge.dart';
import 'package:table_calendar/table_calendar.dart';

class TaskCalendar extends StatefulWidget {
  final List<Task> tasks;
  final Function(Task) onTaskTap;
  
  const TaskCalendar({
    super.key,
    required this.tasks,
    required this.onTaskTap,
  });

  @override
  State<TaskCalendar> createState() => _TaskCalendarState();
}

class _TaskCalendarState extends State<TaskCalendar> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  Map<DateTime, List<Task>> _events = {};
  
  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    _buildEvents();
  }
  
  @override
  void didUpdateWidget(TaskCalendar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.tasks != widget.tasks) {
      _buildEvents();
    }
  }
  
  // Build events map from tasks
  void _buildEvents() {
    final events = <DateTime, List<Task>>{};
    
    for (final task in widget.tasks) {
      // Tasks can appear on both start and due dates
      if (task.startDate != null) {
        final day = DateTime(
          task.startDate!.year,
          task.startDate!.month,
          task.startDate!.day,
        );
        
        if (events[day] == null) {
          events[day] = [];
        }
        
        events[day]!.add(task);
      }
      
      if (task.dueDate != null && task.startDate != task.dueDate) {
        final day = DateTime(
          task.dueDate!.year,
          task.dueDate!.month,
          task.dueDate!.day,
        );
        
        if (events[day] == null) {
          events[day] = [];
        }
        
        // Only add if not already in the list
        if (!events[day]!.contains(task)) {
          events[day]!.add(task);
        }
      }
    }
    
    setState(() {
      _events = events;
    });
  }
  
  // Get tasks for the selected day
  List<Task> _getTasksForDay(DateTime day) {
    final normalizedDay = DateTime(day.year, day.month, day.day);
    return _events[normalizedDay] ?? [];
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selectedDayTasks = _getTasksForDay(_selectedDay!);
    
    return Column(
      children: [
        // Calendar
        TableCalendar(
          firstDay: DateTime.now().subtract(const Duration(days: 365)),
          lastDay: DateTime.now().add(const Duration(days: 365)),
          focusedDay: _focusedDay,
          calendarFormat: CalendarFormat.month,
          eventLoader: _getTasksForDay,
          selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
          onDaySelected: (selectedDay, focusedDay) {
            if (!isSameDay(_selectedDay, selectedDay)) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            }
          },
          onPageChanged: (focusedDay) {
            _focusedDay = focusedDay;
          },
          calendarStyle: CalendarStyle(
            markerDecoration: BoxDecoration(
              color: theme.colorScheme.primary,
              shape: BoxShape.circle,
            ),
            selectedDecoration: BoxDecoration(
              color: theme.colorScheme.primary,
              shape: BoxShape.circle,
            ),
            todayDecoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.3),
              shape: BoxShape.circle,
            ),
          ),
          headerStyle: HeaderStyle(
            formatButtonVisible: false,
            titleCentered: true,
            titleTextStyle: theme.textTheme.titleMedium!,
          ),
        ),
        
        // Divider
        Divider(
          height: 1,
          thickness: 1,
          color: theme.dividerColor,
        ),
        
        // Task list for selected day
        Expanded(
          child: selectedDayTasks.isEmpty
              ? Center(
                  child: Text(
                    'No tasks on ${DateFormat.yMMMMd().format(_selectedDay!)}',
                    style: theme.textTheme.bodyLarge,
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: selectedDayTasks.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final task = selectedDayTasks[index];
                    return _buildTaskCard(context, task);
                  },
                ),
        ),
      ],
    );
  }
  
  Widget _buildTaskCard(BuildContext context, Task task) {
    final theme = Theme.of(context);
    
    // Determine if this task starts or is due on the selected day
    final isStartDate = task.startDate != null && 
        DateFormatter.isSameDay(task.startDate!, _selectedDay!);
    final isDueDate = task.dueDate != null && 
        DateFormatter.isSameDay(task.dueDate!, _selectedDay!);
    
    return Card(
      elevation: 0,
      child: InkWell(
        onTap: () => widget.onTaskTap(task),
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Task header with title and status
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          task.title,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (task.projectName != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Text(
                              task.projectName!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onBackground.withOpacity(0.7),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  StatusBadge(status: task.status),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Date indicators
              Row(
                children: [
                  if (isStartDate)
                    _buildDateIndicator(
                      context,
                      Icons.play_arrow,
                      Colors.green,
                      'Starts Today',
                    ),
                  if (isStartDate && isDueDate)
                    const SizedBox(width: 16),
                  if (isDueDate)
                    _buildDateIndicator(
                      context,
                      Icons.event,
                      task.status == 'completed'
                          ? Colors.green
                          : task.dueDate!.isBefore(DateTime.now())
                              ? Colors.red
                              : Colors.orange,
                      task.status == 'completed'
                          ? 'Due Today (Completed)'
                          : task.dueDate!.isBefore(DateTime.now())
                              ? 'Overdue'
                              : 'Due Today',
                    ),
                ],
              ),
              
              if (task.description != null && task.description!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  task.description!,
                  style: theme.textTheme.bodyMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              
              if (task.assigneeName != null) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(
                      Icons.person,
                      size: 16,
                      color: theme.colorScheme.onBackground.withOpacity(0.7),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Assigned to: ${task.assigneeName}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onBackground.withOpacity(0.7),
                      ),
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
  
  Widget _buildDateIndicator(
    BuildContext context,
    IconData icon,
    Color color,
    String label,
  ) {
    final theme = Theme.of(context);
    
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
            label,
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