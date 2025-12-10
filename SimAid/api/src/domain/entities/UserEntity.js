export default class UserEntity {
  constructor({ user_id, full_name, email, password, role, created_at }) {
    this.user_id = user_id;
    this.full_name = full_name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.created_at = created_at;
  }
}
