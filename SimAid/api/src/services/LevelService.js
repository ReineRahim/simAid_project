import LevelDTO from '../domain/dto/LevelDTO.js';

export class LevelService {
  constructor(levelRepository) {
    this.levelRepository = levelRepository;
  }

  async listLevels() {
    try {
      const levels = await this.levelRepository.findAll();
      return levels.map(LevelDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list levels: ' + error.message);
    }
  }

  async getLevel(id) {
    try {
      const level = await this.levelRepository.findById(id);
      return level ? LevelDTO.fromEntity(level) : null;
    } catch (error) {
      throw new Error(`Failed to get level with id ${id}: ${error.message}`);
    }
  }

  async createLevel(data) {
    try {
      const level = await this.levelRepository.create(data);
      return LevelDTO.fromEntity(level);
    } catch (error) {
      throw new Error('Failed to create level: ' + error.message);
    }
  }

  async updateLevel(id, data) {
    try {
      const level = await this.levelRepository.update(id, data);
      return level ? LevelDTO.fromEntity(level) : null;
    } catch (error) {
      throw new Error(`Failed to update level with id ${id}: ${error.message}`);
    }
  }

  async deleteLevel(id) {
    try {
      return await this.levelRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete level with id ${id}: ${error.message}`);
    }
  }
}
