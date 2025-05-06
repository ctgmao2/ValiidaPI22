import 'package:flutter/material.dart';
import 'package:project_management_app/models/task_model.dart';
import 'package:project_management_app/widgets/status_badge.dart';
import 'package:provider/provider.dart';
import 'package:project_management_app/providers/accessibility_provider.dart';
import 'package:project_management_app/utils/date_formatter.dart';

class GanttChart extends StatefulWidget {
  final List<Task> tasks;
  final DateTime startDate;
  final DateTime endDate;
  final Function(Task) onTaskTap;
  
  const GanttChart({
    super.key,
    required this.tasks,
    required this.startDate,
    required this.endDate,
    required this.onTaskTap,
  });

  @override
  State<GanttChart> createState() => _GanttChartState();
}

class _GanttChartState extends State<GanttChart> {
  // Scroll controllers for synchronized scrolling
  final _horizontalScrollController = ScrollController();
  final _verticalScrollController = ScrollController();
  
  // Column width for task details
  final double _detailsColumnWidth = 200.0;
  
  // Day column width
  final double _dayColumnWidth = 30.0;
  
  @override
  void dispose() {
    _horizontalScrollController.dispose();
    _verticalScrollController.dispose();
    super.dispose();
  }
  
  // Calculate the number of days in the chart
  int get _dayCount {
    return widget.endDate.difference(widget.startDate).inDays + 1;
  }
  
  // Get the list of all dates in the chart period
  List<DateTime> get _allDates {
    return List.generate(
      _dayCount,
      (index) => widget.startDate.add(Duration(days: index)),
    );
  }
  
  // Get the month boundaries for month labels
  List<Map<String, dynamic>> get _monthBoundaries {
    final dates = _allDates;
    final boundaries = <Map<String, dynamic>>[];
    
    if (dates.isEmpty) return boundaries;
    
    DateTime currentMonth = DateTime(dates.first.year, dates.first.month);
    int startIndex = 0;
    
    for (int i = 0; i < dates.length; i++) {
      final date = dates[i];
      final monthStart = DateTime(date.year, date.month);
      
      if (monthStart != currentMonth) {
        // Add the previous month boundary
        boundaries.add({
          'startIndex': startIndex,
          'endIndex': i - 1,
          'month': currentMonth,
        });
        
        // Start a new month
        currentMonth = monthStart;
        startIndex = i;
      }
    }
    
    // Add the last month
    boundaries.add({
      'startIndex': startIndex,
      'endIndex': dates.length - 1,
      'month': currentMonth,
    });
    
    return boundaries;
  }
  
  // Get week boundaries for week numbers
  List<Map<String, dynamic>> get _weekBoundaries {
    final dates = _allDates;
    final boundaries = <Map<String, dynamic>>[];
    
    if (dates.isEmpty) return boundaries;
    
    int currentWeek = _getWeekNumber(dates.first);
    int startIndex = 0;
    
    for (int i = 0; i < dates.length; i++) {
      final date = dates[i];
      final weekNumber = _getWeekNumber(date);
      
      if (weekNumber != currentWeek) {
        // Add the previous week boundary
        boundaries.add({
          'startIndex': startIndex,
          'endIndex': i - 1,
          'weekNumber': currentWeek,
        });
        
        // Start a new week
        currentWeek = weekNumber;
        startIndex = i;
      }
    }
    
    // Add the last week
    boundaries.add({
      'startIndex': startIndex,
      'endIndex': dates.length - 1,
      'weekNumber': currentWeek,
    });
    
    return boundaries;
  }
  
  // Calculate the week number of a date
  int _getWeekNumber(DateTime date) {
    final firstDayOfYear = DateTime(date.year, 1, 1);
    final dayOfYear = date.difference(firstDayOfYear).inDays;
    return ((dayOfYear) / 7).floor() + 1;
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    
    // Sort tasks by start date
    final sortedTasks = [...widget.tasks];
    sortedTasks.sort((a, b) {
      if (a.startDate == null && b.startDate == null) {
        return 0;
      } else if (a.startDate == null) {
        return 1;
      } else if (b.startDate == null) {
        return -1;
      } else {
        return a.startDate!.compareTo(b.startDate!);
      }
    });
    
    // Total width of the chart (excluding the details column)
    final chartWidth = _dayColumnWidth * _dayCount;
    
    return Column(
      children: [
        // Fixed header with month and day labels
        Container(
          color: theme.colorScheme.surface,
          child: Column(
            children: [
              // Month headers
              SizedBox(
                height: 30,
                child: Row(
                  children: [
                    // Empty cell for the fixed task details column
                    SizedBox(width: _detailsColumnWidth),
                    
                    // Month cells
                    Expanded(
                      child: SingleChildScrollView(
                        controller: _horizontalScrollController,
                        scrollDirection: Axis.horizontal,
                        child: SizedBox(
                          width: chartWidth,
                          child: Row(
                            children: _monthBoundaries.map((boundary) {
                              final month = boundary['month'] as DateTime;
                              final startIndex = boundary['startIndex'] as int;
                              final endIndex = boundary['endIndex'] as int;
                              final width = (endIndex - startIndex + 1) * _dayColumnWidth;
                              
                              return SizedBox(
                                width: width,
                                child: Container(
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    border: Border(
                                      right: BorderSide(
                                        color: theme.dividerColor,
                                      ),
                                      bottom: BorderSide(
                                        color: theme.dividerColor,
                                      ),
                                    ),
                                  ),
                                  child: Text(
                                    '${DateFormatter.getMonthName(month.month)} ${month.year}',
                                    style: theme.textTheme.bodySmall,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Day headers
              SizedBox(
                height: 30,
                child: Row(
                  children: [
                    // Empty cell for the fixed task details column
                    SizedBox(width: _detailsColumnWidth),
                    
                    // Day cells
                    Expanded(
                      child: SingleChildScrollView(
                        controller: _horizontalScrollController,
                        scrollDirection: Axis.horizontal,
                        child: SizedBox(
                          width: chartWidth,
                          child: Row(
                            children: _allDates.map((date) {
                              final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
                              final isToday = DateFormatter.isSameDay(date, DateTime.now());
                              
                              return SizedBox(
                                width: _dayColumnWidth,
                                child: Container(
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: isWeekend
                                        ? theme.colorScheme.surfaceVariant.withOpacity(0.3)
                                        : null,
                                    border: Border(
                                      right: BorderSide(
                                        color: theme.dividerColor,
                                      ),
                                      bottom: BorderSide(
                                        color: theme.dividerColor,
                                      ),
                                    ),
                                  ),
                                  child: Text(
                                    date.day.toString(),
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      fontWeight: isToday ? FontWeight.bold : null,
                                      color: isToday ? theme.colorScheme.primary : null,
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        
        // Scrollable task rows
        Expanded(
          child: Row(
            children: [
              // Fixed task details column
              SizedBox(
                width: _detailsColumnWidth,
                child: ListView.builder(
                  controller: _verticalScrollController,
                  itemCount: sortedTasks.length,
                  itemBuilder: (context, index) {
                    final task = sortedTasks[index];
                    
                    return SizedBox(
                      height: 60,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(
                              color: theme.dividerColor,
                            ),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              task.title,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                StatusBadge(
                                  status: task.status,
                                  small: true,
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    task.status,
                                    style: theme.textTheme.bodySmall,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              
              // Scrollable Gantt chart
              Expanded(
                child: SingleChildScrollView(
                  controller: _horizontalScrollController,
                  scrollDirection: Axis.horizontal,
                  child: SizedBox(
                    width: chartWidth,
                    child: ListView.builder(
                      controller: _verticalScrollController,
                      itemCount: sortedTasks.length,
                      itemBuilder: (context, index) {
                        final task = sortedTasks[index];
                        
                        return _buildTaskTimelineRow(
                          context,
                          task,
                          index,
                        );
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildTaskTimelineRow(
    BuildContext context,
    Task task,
    int index,
  ) {
    final theme = Theme.of(context);
    
    return SizedBox(
      height: 60,
      child: Stack(
        children: [
          // Background with day columns
          Row(
            children: _allDates.map((date) {
              final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
              final isToday = DateFormatter.isSameDay(date, DateTime.now());
              
              return SizedBox(
                width: _dayColumnWidth,
                child: Container(
                  decoration: BoxDecoration(
                    color: isWeekend
                        ? theme.colorScheme.surfaceVariant.withOpacity(0.3)
                        : null,
                    border: Border(
                      right: BorderSide(
                        color: theme.dividerColor,
                      ),
                      bottom: BorderSide(
                        color: theme.dividerColor,
                      ),
                    ),
                  ),
                  child: isToday
                      ? Container(
                          width: double.infinity,
                          height: double.infinity,
                          decoration: BoxDecoration(
                            border: Border(
                              left: BorderSide(
                                color: theme.colorScheme.primary,
                                width: 2,
                              ),
                              right: BorderSide(
                                color: theme.colorScheme.primary,
                                width: 2,
                              ),
                            ),
                          ),
                        )
                      : null,
                ),
              );
            }).toList(),
          ),
          
          // Task bar (if task has dates)
          if (task.startDate != null && task.dueDate != null)
            Positioned(
              left: _getPositionForDate(task.startDate!),
              top: 15,
              child: GestureDetector(
                onTap: () => widget.onTaskTap(task),
                child: Container(
                  width: _getTaskBarWidth(task),
                  height: 30,
                  decoration: BoxDecoration(
                    color: _getTaskColor(task).withOpacity(0.8),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: _getTaskColor(task),
                      width: 1,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      task.title,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ),
            ),
          
          // Mark due date with an icon for tasks with due date but no start date
          if (task.startDate == null && task.dueDate != null)
            Positioned(
              left: _getPositionForDate(task.dueDate!) - 15,
              top: 15,
              child: GestureDetector(
                onTap: () => widget.onTaskTap(task),
                child: Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: _getTaskColor(task).withOpacity(0.8),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: _getTaskColor(task),
                      width: 1,
                    ),
                  ),
                  child: Icon(
                    Icons.event_available,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  // Calculate left position for a date
  double _getPositionForDate(DateTime date) {
    final daysDifference = date.difference(widget.startDate).inDays;
    // Ensure the position is within bounds
    final boundedDays = daysDifference.clamp(0, _dayCount - 1);
    return boundedDays * _dayColumnWidth;
  }
  
  // Calculate width of the task bar based on start and due dates
  double _getTaskBarWidth(Task task) {
    if (task.startDate == null || task.dueDate == null) {
      return _dayColumnWidth;
    }
    
    // Ensure start date is before end date
    final startDate = task.startDate!.isBefore(task.dueDate!) 
        ? task.startDate! 
        : task.dueDate!;
    final endDate = task.dueDate!.isAfter(task.startDate!) 
        ? task.dueDate! 
        : task.startDate!;
    
    // Make sure dates are within chart bounds
    final boundedStartDate = startDate.isBefore(widget.startDate) 
        ? widget.startDate 
        : startDate;
    final boundedEndDate = endDate.isAfter(widget.endDate) 
        ? widget.endDate 
        : endDate;
    
    // Calculate width (add 1 to include the end day)
    final daysDifference = boundedEndDate.difference(boundedStartDate).inDays + 1;
    return daysDifference * _dayColumnWidth;
  }
  
  // Get color based on task status
  Color _getTaskColor(Task task) {
    switch (task.status) {
      case 'completed':
        return Colors.green;
      case 'in-progress':
        return Colors.blue;
      case 'blocked':
        return Colors.red;
      case 'review':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }
}