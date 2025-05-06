class Task {
  final int id;
  final String title;
  final String? description;
  final String status;
  final String priority;
  final int projectId;
  final String? projectName;
  final int? assigneeId;
  final String? assigneeName;
  final DateTime? startDate;
  final DateTime? dueDate;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final double? estimatedHours;
  final double? actualHours;
  final List<int>? dependsOn;
  final Map<String, dynamic>? customFields;
  
  Task({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    required this.projectId,
    this.projectName,
    this.assigneeId,
    this.assigneeName,
    this.startDate,
    this.dueDate,
    this.completedAt,
    required this.createdAt,
    required this.updatedAt,
    this.estimatedHours,
    this.actualHours,
    this.dependsOn,
    this.customFields,
  });
  
  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      status: json['status'] ?? 'new',
      priority: json['priority'] ?? 'medium',
      projectId: json['projectId'],
      projectName: json['projectName'],
      assigneeId: json['assigneeId'],
      assigneeName: json['assigneeName'],
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate']) : null,
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      estimatedHours: json['estimatedHours']?.toDouble(),
      actualHours: json['actualHours']?.toDouble(),
      dependsOn: json['dependsOn'] != null
          ? List<int>.from(json['dependsOn'])
          : null,
      customFields: json['customFields'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'status': status,
      'priority': priority,
      'projectId': projectId,
      'projectName': projectName,
      'assigneeId': assigneeId,
      'assigneeName': assigneeName,
      'startDate': startDate?.toIso8601String(),
      'dueDate': dueDate?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'estimatedHours': estimatedHours,
      'actualHours': actualHours,
      'dependsOn': dependsOn,
      'customFields': customFields,
    };
  }
  
  // Copy with method for creating a new instance with some updated properties
  Task copyWith({
    int? id,
    String? title,
    String? description,
    String? status,
    String? priority,
    int? projectId,
    String? projectName,
    int? assigneeId,
    String? assigneeName,
    DateTime? startDate,
    DateTime? dueDate,
    DateTime? completedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    double? estimatedHours,
    double? actualHours,
    List<int>? dependsOn,
    Map<String, dynamic>? customFields,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      projectId: projectId ?? this.projectId,
      projectName: projectName ?? this.projectName,
      assigneeId: assigneeId ?? this.assigneeId,
      assigneeName: assigneeName ?? this.assigneeName,
      startDate: startDate ?? this.startDate,
      dueDate: dueDate ?? this.dueDate,
      completedAt: completedAt ?? this.completedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      estimatedHours: estimatedHours ?? this.estimatedHours,
      actualHours: actualHours ?? this.actualHours,
      dependsOn: dependsOn ?? this.dependsOn,
      customFields: customFields ?? this.customFields,
    );
  }
}