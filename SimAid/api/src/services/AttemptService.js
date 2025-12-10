import AttemptDTO from '../domain/dto/AttemptDTO.js';

export class AttemptService {
  constructor(attemptRepository) {
    this.attemptRepository = attemptRepository;
  }

  async listAttempts() {
    try {
      const attempts = await this.attemptRepository.findAll();
      return attempts.map(AttemptDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list attempts: ' + error.message);
    }
  }

  async getAttempt(id) {
    try {
      const attempt = await this.attemptRepository.findById(id);
      return attempt ? AttemptDTO.fromEntity(attempt) : null;
    } catch (error) {
      throw new Error(`Failed to get attempt with id ${id}: ${error.message}`);
    }
  }

  async getUserAttempt(user_id, scenario_id) {
    try {
      const attempt = await this.attemptRepository.findByUserAndScenario(user_id, scenario_id);
      return attempt ? AttemptDTO.fromEntity(attempt) : null;
    } catch (error) {
      throw new Error(`Failed to get user attempt: ${error.message}`);
    }
  }

  async saveBestScore(data) {
    try {
      const attempt = await this.attemptRepository.upsertBestScore(data);
      return AttemptDTO.fromEntity(attempt);
    } catch (error) {
      throw new Error('Failed to save best score: ' + error.message);
    }
  }

  async countPerfectByUserInLevel(user_id, level_id) {
    return await this.attemptRepository.countPerfectByUserInLevel(user_id, level_id);
  }

  async countScenariosInLevel(level_id) {
    return await this.attemptRepository.countScenariosInLevel(level_id);
  }

  async getUserAttemptsByLevel(userId, levelId) {
  return this.attemptRepository.getUserAttemptsByLevel(userId, levelId);
}

}


