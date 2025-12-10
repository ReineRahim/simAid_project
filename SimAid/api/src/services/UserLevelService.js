import UserLevelDTO from "../domain/dto/UserLevelDTO.js";

export class UserLevelService {
  constructor(userLevelRepository) {
    this.userLevelRepository = userLevelRepository;
  }

  async listUserLevels() {
    const records = await this.userLevelRepository.findAll();
    return records.map(UserLevelDTO.fromEntity);
  }

  async getUserLevels(user_id) {
    const records = await this.userLevelRepository.findByUser(user_id);
    return records.map(UserLevelDTO.fromEntity);
  }

  async getUserLevel(user_id, level_id) {
    const record = await this.userLevelRepository.findByUserAndLevel(user_id, level_id);
    return record ? UserLevelDTO.fromEntity(record) : null;
  }

  async getById(user_level_id) {
    const record = await this.userLevelRepository.findById(user_level_id);
    return record ? UserLevelDTO.fromEntity(record) : null;
  }

  async createUserLevel(data) {
    const record = await this.userLevelRepository.create(data);
    return UserLevelDTO.fromEntity(record);
  }

  // FIX: this is the method the controller should call for PUT /:id
  async updateUserLevelStatus(user_level_id, data) {
    const record = await this.userLevelRepository.updateStatus(user_level_id, data);
    return record ? UserLevelDTO.fromEntity(record) : null;
  }

  async deleteUserLevel(user_level_id) {
    return this.userLevelRepository.delete(user_level_id);
  }

  async upsertUserLevelProgress({ user_id, level_id, unlocked = false, completed = false }) {
    const record = await this.userLevelRepository.upsertProgress({
      user_id,
      level_id,
      unlocked,
      completed,
    });
    return UserLevelDTO.fromEntity(record);
  }
}
