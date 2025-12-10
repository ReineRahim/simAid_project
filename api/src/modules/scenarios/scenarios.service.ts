import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenarioEntity } from '../../domain/entities/scenario.entity';
import { ScenarioStepEntity } from '../../domain/entities/scenario-step.entity';
import { AttemptEntity } from '../../domain/entities/attempt.entity';
import { BadgeEntity } from '../../domain/entities/badge.entity';
import { UserBadgeEntity } from '../../domain/entities/user-badge.entity';
import { UserLevelEntity } from '../../domain/entities/user-level.entity';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { ScenarioStepsService, ScenarioStepResponse } from '../scenario-steps/scenario-steps.service';

export type ScenarioResponse = ScenarioEntity;

@Injectable()
export class ScenariosService {
  constructor(
    @InjectRepository(ScenarioEntity)
    private readonly scenarioRepository: Repository<ScenarioEntity>,
    @InjectRepository(ScenarioStepEntity)
    private readonly stepRepository: Repository<ScenarioStepEntity>,
    @InjectRepository(AttemptEntity)
    private readonly attemptRepository: Repository<AttemptEntity>,
    @InjectRepository(BadgeEntity)
    private readonly badgeRepository: Repository<BadgeEntity>,
    @InjectRepository(UserBadgeEntity)
    private readonly userBadgeRepository: Repository<UserBadgeEntity>,
    @InjectRepository(UserLevelEntity)
    private readonly userLevelRepository: Repository<UserLevelEntity>,
    private readonly scenarioStepsService: ScenarioStepsService,
  ) {}

  /**
   * List all scenarios ordered by id descending.
   * Mirrors Express GET /scenarios.
   */
  async listScenarios(): Promise<ScenarioResponse[]> {
    try {
      return await this.scenarioRepository.find({
        order: { scenario_id: 'DESC' },
      });
    } catch (error) {
      throw new Error('Failed to list scenarios: ' + (error as Error).message);
    }
  }

  /**
   * Get a scenario by id.
   * Mirrors Express GET /scenarios/:id.
   */
  async getScenario(id: number): Promise<ScenarioResponse | null> {
    try {
      return await this.scenarioRepository.findOne({ where: { scenario_id: id } });
    } catch (error) {
      throw new Error(`Failed to get scenario with id ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * List scenarios by level.
   * Mirrors Express GET /scenarios/level/:levelId.
   */
  async listByLevel(levelId: number): Promise<ScenarioResponse[]> {
    try {
      return await this.scenarioRepository.find({
        where: { level_id: levelId },
        order: { scenario_id: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Failed to list scenarios by level ${levelId}: ${(error as Error).message}`);
    }
  }

  /**
   * Create scenario.
   * Mirrors Express POST /scenarios.
   */
  async createScenario(payload: CreateScenarioDto): Promise<ScenarioResponse> {
    try {
      const entity = this.scenarioRepository.create(payload);
      return await this.scenarioRepository.save(entity);
    } catch (error) {
      throw new Error('Failed to create scenario: ' + (error as Error).message);
    }
  }

  /**
   * Update scenario.
   * Mirrors Express PUT /scenarios/:id.
   */
  async updateScenario(id: number, payload: UpdateScenarioDto): Promise<ScenarioResponse | null> {
    try {
      const existing = await this.scenarioRepository.findOne({ where: { scenario_id: id } });
      if (!existing) return null;
      const merged = this.scenarioRepository.merge(existing, payload);
      return await this.scenarioRepository.save(merged);
    } catch (error) {
      throw new Error(`Failed to update scenario with id ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Delete scenario.
   * Mirrors Express DELETE /scenarios/:id.
   */
  async deleteScenario(id: number): Promise<boolean> {
    try {
      const result = await this.scenarioRepository.delete({ scenario_id: id });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete scenario with id ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Count scenarios by level.
   * Mirrors repository countByLevel helper.
   */
  async countByLevel(levelId: number): Promise<number> {
    return this.scenarioRepository.count({ where: { level_id: levelId } });
  }

  /**
   * Retrieve scenario with ordered steps.
   */
  async getScenarioWithSteps(id: number): Promise<{ scenario: ScenarioResponse; steps: ScenarioStepResponse[] } | null> {
    const scenario = await this.getScenario(id);
    if (!scenario) return null;
    const steps = await this.scenarioStepsService.getStepsByScenario(id);
    return { scenario, steps };
  }

  /**
   * Retrieve raw step entities (used for GraphQL).
   */
  async getStepEntitiesByScenario(scenarioId: number): Promise<ScenarioStepEntity[]> {
    return this.stepRepository.find({
      where: { scenario_id: scenarioId },
      order: { step_order: 'ASC' },
    });
  }

  /**
   * Upsert best score (attempts table) for a user and scenario.
   */
  async upsertBestScore(params: { user_id: number; scenario_id: number; score: number; all_correct: boolean }) {
    const { user_id, scenario_id, score } = params;
    await this.attemptRepository.query(
      `
      INSERT INTO attempts (user_id, scenario_id, score)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        score = GREATEST(score, VALUES(score)),
        completed_at = CURRENT_TIMESTAMP;
    `,
      [user_id, scenario_id, score],
    );
  }

  /**
   * Count perfect scores (score=100) for a user in a level.
   */
  async countPerfectByUserInLevel(userId: number, levelId: number): Promise<number> {
    const result = await this.attemptRepository
      .createQueryBuilder('a')
      .innerJoin(ScenarioEntity, 's', 's.scenario_id = a.scenario_id')
      .where('a.user_id = :userId', { userId })
      .andWhere('s.level_id = :levelId', { levelId })
      .andWhere('a.score = 100')
      .select('COUNT(*)', 'count')
      .getRawOne<{ count: string }>();
    return parseInt(result?.count ?? '0', 10);
  }

  /**
   * Upsert user level progress.
   */
  async upsertUserLevelProgress(progress: {
    user_id: number;
    level_id: number;
    unlocked: boolean;
    completed: boolean;
  }) {
    await this.userLevelRepository
      .createQueryBuilder()
      .insert()
      .into(UserLevelEntity)
      .values(progress)
      .orUpdate(['unlocked', 'completed'], ['user_id', 'level_id'])
      .execute();
  }

  /**
   * Find badge by level id.
   */
  async findBadgeByLevel(levelId: number): Promise<BadgeEntity | null> {
    return this.badgeRepository.findOne({ where: { level_id: levelId } });
  }

  /**
   * Find user badge combination.
   */
  async findUserBadge(userId: number, badgeId: number): Promise<UserBadgeEntity | null> {
    return this.userBadgeRepository.findOne({
      where: { user_id: userId, badge_id: badgeId },
    });
  }

  /**
   * Create user badge.
   */
  async createUserBadge(userId: number, badgeId: number): Promise<UserBadgeEntity> {
    const entity = this.userBadgeRepository.create({ user_id: userId, badge_id: badgeId });
    return this.userBadgeRepository.save(entity);
  }
}
