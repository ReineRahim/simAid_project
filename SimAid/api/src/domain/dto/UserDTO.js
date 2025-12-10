export default class UserDTO {
  constructor({ user_id, full_name, email, role, created_at }) {
    this.id = user_id;          
    this.name = full_name;      
    this.email = email;
    this.role = role;
    this.created_at = created_at;
  }

  static fromEntity(entity) {
    if (!entity) return null;

    const { user_id, full_name, email, role, created_at } = entity;
    return new UserDTO({ user_id, full_name, email, role, created_at });
  }
}
