class Project {
  final int id;
  final String name;
  final String? description;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? managerId;
  final Map<String, dynamic>? customFields;

  Project({
    required this.id,
    required this.name,
    this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.managerId,
    this.customFields,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      managerId: json['managerId'],
      customFields: json['customFields'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'managerId': managerId,
      'customFields': customFields,
    };
  }

  Project copyWith({
    int? id,
    String? name,
    String? description,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? managerId,
    Map<String, dynamic>? customFields,
  }) {
    return Project(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      managerId: managerId ?? this.managerId,
      customFields: customFields ?? this.customFields,
    );
  }
}