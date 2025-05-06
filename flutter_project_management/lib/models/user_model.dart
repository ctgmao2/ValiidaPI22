class User {
  final int id;
  final String username;
  final String fullName;
  final String? role;
  final String initials;
  final String avatarColor;
  final String? email;
  final Map<String, dynamic>? preferences;

  User({
    required this.id,
    required this.username,
    required this.fullName,
    this.role,
    required this.initials,
    required this.avatarColor,
    this.email,
    this.preferences,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      fullName: json['fullName'],
      role: json['role'],
      initials: json['initials'],
      avatarColor: json['avatarColor'],
      email: json['email'],
      preferences: json['preferences'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'fullName': fullName,
      'role': role,
      'initials': initials,
      'avatarColor': avatarColor,
      'email': email,
      'preferences': preferences,
    };
  }

  User copyWith({
    int? id,
    String? username,
    String? fullName,
    String? role,
    String? initials,
    String? avatarColor,
    String? email,
    Map<String, dynamic>? preferences,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      fullName: fullName ?? this.fullName,
      role: role ?? this.role,
      initials: initials ?? this.initials,
      avatarColor: avatarColor ?? this.avatarColor,
      email: email ?? this.email,
      preferences: preferences ?? this.preferences,
    );
  }
}