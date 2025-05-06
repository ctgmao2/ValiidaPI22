import 'package:intl/intl.dart';

class DateFormatter {
  // Format date with time 
  static String formatDateTime(DateTime? dateTime, {String format = 'MMM d, yyyy h:mm a'}) {
    if (dateTime == null) return 'N/A';
    return DateFormat(format).format(dateTime);
  }
  
  // Format date only
  static String formatDate(DateTime? date, {String format = 'MMM d, yyyy'}) {
    if (date == null) return 'N/A';
    return DateFormat(format).format(date);
  }
  
  // Format relative date (Today, Yesterday, etc)
  static String formatRelativeDate(DateTime? date) {
    if (date == null) return 'N/A';
    
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dateOnly = DateTime(date.year, date.month, date.day);
    
    final difference = today.difference(dateOnly).inDays;
    
    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference > 1 && difference < 7) {
      return DateFormat('EEEE').format(date); // Day name
    } else {
      return DateFormat('MMM d, yyyy').format(date);
    }
  }
  
  // Format custom date according to user's preference
  static String formatCustomDate(DateTime? date, String format) {
    if (date == null) return 'N/A';
    
    if (format == 'dd-mm-yyyy') {
      // Brazilian format
      return '${date.day.toString().padLeft(2, '0')}-${date.month.toString().padLeft(2, '0')}-${date.year}';
    } else {
      // American format (default)
      return '${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}-${date.year}';
    }
  }
  
  // Calculate days remaining
  static String getDaysRemaining(DateTime? dueDate) {
    if (dueDate == null) return 'No due date';
    
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dueDateOnly = DateTime(dueDate.year, dueDate.month, dueDate.day);
    
    final daysRemaining = dueDateOnly.difference(today).inDays;
    
    if (daysRemaining < 0) {
      return 'Overdue by ${-daysRemaining} ${-daysRemaining == 1 ? 'day' : 'days'}';
    } else if (daysRemaining == 0) {
      return 'Due today';
    } else {
      return 'Due in $daysRemaining ${daysRemaining == 1 ? 'day' : 'days'}';
    }
  }
}