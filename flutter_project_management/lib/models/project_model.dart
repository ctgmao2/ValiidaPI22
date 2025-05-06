class Project {
  final int id;
  final String name;
  final String? description;
  final String status;
  final DateTime? startDate;
  final DateTime? endDate;
  final int? parentId;
  final int? tasksCount;
  final int? inProgressCount;
  final int? completedCount;
  final int? overdueCount;
  
  Project({
    required this.id,
    required this.name,
    this.description,
    required this.status,
    this.startDate,
    this.endDate,
    this.parentId,
    this.tasksCount,
    this.inProgressCount,
    this.completedCount,
    this.overdueCount,
  });
  
  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      status: json['status'] ?? 'active',
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      parentId: json['parentId'],
      tasksCount: json['tasksCount'],
      inProgressCount: json['inProgressCount'],
      completedCount: json['completedCount'],
      overdueCount: json['overdueCount'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'status': status,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'parentId': parentId,
      'tasksCount': tasksCount,
      'inProgressCount': inProgressCount,
      'completedCount': completedCount,
      'overdueCount': overdueCount,
    };
  }
  
  // Copy with method for creating a new instance with some updated properties
  Project copyWith({
    int? id,
    String? name,
    String? description,
    String? status,
    DateTime? startDate,
    DateTime? endDate,
    int? parentId,
    int? tasksCount,
    int? inProgressCount,
    int? completedCount,
    int? overdueCount,
  }) {
    return Project(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      status: status ?? this.status,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      parentId: parentId ?? this.parentId,
      tasksCount: tasksCount ?? this.tasksCount,
      inProgressCount: inProgressCount ?? this.inProgressCount,
      completedCount: completedCount ?? this.completedCount,
      overdueCount: overdueCount ?? this.overdueCount,
    );
  }
}

// Valid project statuses
class ProjectStatus {
  static const String active = 'active';
  static const String onHold = 'on-hold';
  static const String completed = 'completed';
  static const String archived = 'archived';
  
  static const List<String> values = [
    active,
    onHold,
    completed,
    archived,
  ];
}