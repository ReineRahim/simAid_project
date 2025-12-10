import BadgesDTO from '../domain/dto/BadgesDTO.js';

export class BadgesService {
  constructor(badgesRepository) {
    this.badgesRepository = badgesRepository;
  }

  async listBadges() {
    try {
      const badges = await this.badgesRepository.findAll();
      return badges.map(BadgesDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list badges: ' + error.message);
    }
  }

  async getBadge(id) {
    try {
      const badge = await this.badgesRepository.findById(id);
      return badge ? BadgesDTO.fromEntity(badge) : null;
    } catch (error) {
      throw new Error(`Failed to get badge with id ${id}: ${error.message}`);
    }
  }

  async getBadgesByLevel(level_id) {
    try {
      const badges = await this.badgesRepository.findByLevel(level_id);
      return badges.map(BadgesDTO.fromEntity);
    } catch (error) {
      throw new Error(`Failed to get badges for level ${level_id}: ${error.message}`);
    }
  }

  async createBadge(data) {
    try {
      const badge = await this.badgesRepository.create(data);
      return BadgesDTO.fromEntity(badge);
    } catch (error) {
      throw new Error('Failed to create badge: ' + error.message);
    }
  }

  async updateBadge(id, data) {
    try {
      const badge = await this.badgesRepository.update(id, data);
      return badge ? BadgesDTO.fromEntity(badge) : null;
    } catch (error) {
      throw new Error(`Failed to update badge with id ${id}: ${error.message}`);
    }
  }

  async deleteBadge(id) {
    try {
      return await this.badgesRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete badge with id ${id}: ${error.message}`);
    }
  }
}
