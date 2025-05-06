class TaskStatus {
  static const String NEW = 'new';
  static const String IN_PROGRESS = 'in-progress';
  static const String COMPLETED = 'completed';
  static const String CANCELLED = 'cancelled';
  
  static const List<String> values = [NEW, IN_PROGRESS, COMPLETED, CANCELLED];
  
  static String getDisplayName(String status) {
    switch (status) {
      case NEW:
        return 'New';
      case IN_PROGRESS:
        return 'In Progress';
      case COMPLETED:
        return 'Completed';
      case CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }
}

class TaskPriority {
  static const String HIGH = 'high';
  static const String MEDIUM = 'medium';
  static const String LOW = 'low';
  
  static const List<String> values = [HIGH, MEDIUM, LOW];
  
  static String getDisplayName(String priority) {
    switch (priority) {
      case HIGH:
        return 'High';
      case MEDIUM:
        return 'Medium';
      case LOW:
        return 'Low';
      default:
        return priority;
    }
  }
}

class ProjectStatus {
  static const String ACTIVE = 'active';
  static const String ARCHIVED = 'archived';
  static const String ON_HOLD = 'on-hold';
  static const String COMPLETED = 'completed';
  
  static const List<String> values = [ACTIVE, ARCHIVED, ON_HOLD, COMPLETED];
  
  static String getDisplayName(String status) {
    switch (status) {
      case ACTIVE:
        return 'Active';
      case ARCHIVED:
        return 'Archived';
      case ON_HOLD:
        return 'On Hold';
      case COMPLETED:
        return 'Completed';
      default:
        return status;
    }
  }
}

class ActivityType {
  static const String TASK_CREATED = 'task-created';
  static const String TASK_UPDATED = 'task-updated';
  static const String TASK_DELETED = 'task-deleted';
  static const String PROJECT_CREATED = 'project-created';
  static const String PROJECT_UPDATED = 'project-updated';
  static const String PROJECT_DELETED = 'project-deleted';
  static const String USER_JOINED = 'user-joined';
  
  static String getDisplayName(String type) {
    switch (type) {
      case TASK_CREATED:
        return 'Task Created';
      case TASK_UPDATED:
        return 'Task Updated';
      case TASK_DELETED:
        return 'Task Deleted';
      case PROJECT_CREATED:
        return 'Project Created';
      case PROJECT_UPDATED:
        return 'Project Updated';
      case PROJECT_DELETED:
        return 'Project Deleted';
      case USER_JOINED:
        return 'User Joined';
      default:
        return type;
    }
  }
}