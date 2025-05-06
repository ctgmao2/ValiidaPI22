class Activity {
  final int id;
  final String type;
  final String description;
  final int? userId;
  final int? taskId;
  final int? projectId;
  final String? userName;
  final String? taskTitle;
  final String? projectName;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;
  
  Activity({
    required this.id,
    required this.type,
    required this.description,
    this.userId,
    this.taskId,
    this.projectId,
    this.userName,
    this.taskTitle,
    this.projectName,
    required this.createdAt,
    this.metadata,
  });
  
  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'],
      type: json['type'],
      description: json['description'],
      userId: json['userId'],
      taskId: json['taskId'],
      projectId: json['projectId'],
      userName: json['userName'],
      taskTitle: json['taskTitle'],
      projectName: json['projectName'],
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      metadata: json['metadata'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'description': description,
      'userId': userId,
      'taskId': taskId,
      'projectId': projectId,
      'userName': userName,
      'taskTitle': taskTitle,
      'projectName': projectName,
      'createdAt': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

// Activity types
class ActivityType {
  static const String userLogin = 'user-login';
  static const String userCreated = 'user-created';
  static const String userUpdated = 'user-updated';
  static const String projectCreated = 'project-created';
  static const String projectUpdated = 'project-updated';
  static const String taskCreated = 'task-created';
  static const String taskUpdated = 'task-updated';
  static const String taskStatusChanged = 'task-status-changed';
  static const String taskAssigned = 'task-assigned';
  static const String taskCommented = 'task-commented';
  static const String timeTracked = 'time-tracked';
}