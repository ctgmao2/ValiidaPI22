class Task {
  final int id;
  final String title;
  final String? description;
  final String status;
  final String priority;
  final int progress;
  final int? estimatedHours;
  final int spentHours;
  final DateTime? dueDate;
  final DateTime? startDate;
  final int? taskTypeId;
  final int projectId;
  final int? assigneeId;
  final int? reporterId;
  final int? parentTaskId;
  final Map<String, dynamic>? customFields;
  final DateTime createdAt;
  final DateTime updatedAt;

  Task({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    required this.progress,
    this.estimatedHours,
    required this.spentHours,
    this.dueDate,
    this.startDate,
    this.taskTypeId,
    required this.projectId,
    this.assigneeId,
    this.reporterId,
    this.parentTaskId,
    this.customFields,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      status: json['status'],
      priority: json['priority'],
      progress: json['progress'] ?? 0,
      estimatedHours: json['estimatedHours'],
      spentHours: json['spentHours'] ?? 0,
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate']) : null,
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      taskTypeId: json['taskTypeId'],
      projectId: json['projectId'],
      assigneeId: json['assigneeId'],
      reporterId: json['reporterId'],
      parentTaskId: json['parentTaskId'],
      customFields: json['customFields'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'status': status,
      'priority': priority,
      'progress': progress,
      'estimatedHours': estimatedHours,
      'spentHours': spentHours,
      'dueDate': dueDate?.toIso8601String(),
      'startDate': startDate?.toIso8601String(),
      'taskTypeId': taskTypeId,
      'projectId': projectId,
      'assigneeId': assigneeId,
      'reporterId': reporterId,
      'parentTaskId': parentTaskId,
      'customFields': customFields,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Task copyWith({
    int? id,
    String? title,
    String? description,
    String? status,
    String? priority,
    int? progress,
    int? estimatedHours,
    int? spentHours,
    DateTime? dueDate,
    DateTime? startDate,
    int? taskTypeId,
    int? projectId,
    int? assigneeId,
    int? reporterId,
    int? parentTaskId,
    Map<String, dynamic>? customFields,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      progress: progress ?? this.progress,
      estimatedHours: estimatedHours ?? this.estimatedHours,
      spentHours: spentHours ?? this.spentHours,
      dueDate: dueDate ?? this.dueDate,
      startDate: startDate ?? this.startDate,
      taskTypeId: taskTypeId ?? this.taskTypeId,
      projectId: projectId ?? this.projectId,
      assigneeId: assigneeId ?? this.assigneeId,
      reporterId: reporterId ?? this.reporterId,
      parentTaskId: parentTaskId ?? this.parentTaskId,
      customFields: customFields ?? this.customFields,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}