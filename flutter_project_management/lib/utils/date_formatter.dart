import 'package:intl/intl.dart';

class DateFormatter {
  // Format date according to the user's preferred format
  static String formatDate(DateTime date, String format) {
    try {
      if (format == 'mm-dd-yyyy') {
        return DateFormat('MM/dd/yyyy').format(date);
      } else if (format == 'dd-mm-yyyy') {
        return DateFormat('dd/MM/yyyy').format(date);
      } else {
        // Default to MM/dd/yyyy
        return DateFormat('MM/dd/yyyy').format(date);
      }
    } catch (e) {
      return 'Invalid date';
    }
  }
  
  // Format date with time
  static String formatDateTime(DateTime date, String format) {
    try {
      if (format == 'mm-dd-yyyy') {
        return DateFormat('MM/dd/yyyy HH:mm').format(date);
      } else if (format == 'dd-mm-yyyy') {
        return DateFormat('dd/MM/yyyy HH:mm').format(date);
      } else {
        // Default to MM/dd/yyyy
        return DateFormat('MM/dd/yyyy HH:mm').format(date);
      }
    } catch (e) {
      return 'Invalid date';
    }
  }
  
  // Get relative date (e.g., "2 days ago", "Just now")
  static String formatRelativeDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      final minutes = difference.inMinutes;
      return '$minutes ${minutes == 1 ? 'minute' : 'minutes'} ago';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return '$hours ${hours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inDays < 7) {
      final days = difference.inDays;
      return '$days ${days == 1 ? 'day' : 'days'} ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '$weeks ${weeks == 1 ? 'week' : 'weeks'} ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'year' : 'years'} ago';
    }
  }
  
  // Get days remaining until a date
  static String getDaysRemaining(DateTime? date) {
    if (date == null) {
      return 'No due date';
    }
    
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dueDate = DateTime(date.year, date.month, date.day);
    final difference = dueDate.difference(today).inDays;
    
    if (difference < 0) {
      return '${-difference} ${-difference == 1 ? 'day' : 'days'} overdue';
    } else if (difference == 0) {
      return 'Due today';
    } else if (difference == 1) {
      return 'Due tomorrow';
    } else {
      return 'Due in $difference days';
    }
  }
  
  // Check if two dates are the same day
  static bool isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year &&
        date1.month == date2.month &&
        date1.day == date2.day;
  }
  
  // Get the month name from a month number (1-12)
  static String getMonthName(int month) {
    switch (month) {
      case 1:
        return 'January';
      case 2:
        return 'February';
      case 3:
        return 'March';
      case 4:
        return 'April';
      case 5:
        return 'May';
      case 6:
        return 'June';
      case 7:
        return 'July';
      case 8:
        return 'August';
      case 9:
        return 'September';
      case 10:
        return 'October';
      case 11:
        return 'November';
      case 12:
        return 'December';
      default:
        return '';
    }
  }
  
  // Get a short month name from a month number (1-12)
  static String getShortMonthName(int month) {
    switch (month) {
      case 1:
        return 'Jan';
      case 2:
        return 'Feb';
      case 3:
        return 'Mar';
      case 4:
        return 'Apr';
      case 5:
        return 'May';
      case 6:
        return 'Jun';
      case 7:
        return 'Jul';
      case 8:
        return 'Aug';
      case 9:
        return 'Sep';
      case 10:
        return 'Oct';
      case 11:
        return 'Nov';
      case 12:
        return 'Dec';
      default:
        return '';
    }
  }
}