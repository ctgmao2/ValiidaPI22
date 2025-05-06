class User {
  final int id;
  final String username;
  final String fullName;
  final String? email;
  final String? role;
  final String avatarColor;
  final String initials;
  
  User({
    required this.id,
    required this.username,
    required this.fullName,
    this.email,
    this.role,
    required this.avatarColor,
    required this.initials,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    // Generate initials from full name
    final nameParts = (json['fullName'] as String).split(' ');
    final initials = nameParts.length > 1
        ? '${nameParts[0][0]}${nameParts[1][0]}'
        : nameParts[0].length > 1
            ? nameParts[0].substring(0, 2)
            : '${nameParts[0][0]}';
    
    // Generate a deterministic color based on the username
    final colorIndex = json['username'].hashCode % avatarColors.length;
    final avatarColor = json['avatarColor'] ?? avatarColors[colorIndex.abs()];
    
    return User(
      id: json['id'],
      username: json['username'],
      fullName: json['fullName'],
      email: json['email'],
      role: json['role'],
      avatarColor: avatarColor,
      initials: json['initials'] ?? initials.toUpperCase(),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'fullName': fullName,
      'email': email,
      'role': role,
      'avatarColor': avatarColor,
      'initials': initials,
    };
  }
}

// List of colors for user avatars
const List<String> avatarColors = [
  '#1abc9c', // Turquoise
  '#2ecc71', // Emerald
  '#3498db', // Peter River
  '#9b59b6', // Amethyst
  '#34495e', // Wet Asphalt
  '#16a085', // Green Sea
  '#27ae60', // Nephritis
  '#2980b9', // Belize Hole
  '#8e44ad', // Wisteria
  '#2c3e50', // Midnight Blue
  '#f1c40f', // Sunflower
  '#e67e22', // Carrot
  '#e74c3c', // Alizarin
  '#d35400', // Pumpkin
  '#c0392b', // Pomegranate
];