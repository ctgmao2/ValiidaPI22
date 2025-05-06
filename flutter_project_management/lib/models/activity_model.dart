class Activity {
  final int id;
  final String type;
  final String description;
  final int? userId;
  final int? taskId;
  final int? projectId;
  final DateTime createdAt;

  Activity({
    required this.id,
    required this.type,
    required this.description,
    this.userId,
    this.taskId,
    this.projectId,
    required this.createdAt,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'],
      type: json['type'],
      description: json['description'],
      userId: json['userId'],
      taskId: json['taskId'],
      projectId: json['projectId'],
      createdAt: DateTime.parse(json['createdAt']),
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
      'createdAt': createdAt.toIso8601String(),
    };
  }
}