import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttemptEntity } from '../../domain/entities/attempt.entity';
import { CreateAttemptDto } from './dto/create-attempt.dto';

export type AttemptLevelScore = { scenario_id: number; score: number };

@Injectable()
export class AttemptsService {
  constructor(
    @InjectRepository(AttemptEntity)
    private readonly attemptRepository: Repository<AttemptEntity>,
  ) {}

  /**
   * List all attempts (admin/debug).
   * Mirrors Express GET /attempts.
   */
  async listAttempts(): Promise<AttemptEntity[]> {
    try {
      return await this.attemptRepository.find({
        order: { completed_at: 'DESC' },
      });
    } catch (error) {
      throw new Error('Failed to list attempts: ' + (error as Error).message);
    }
  }

  /**
   * Get attempt by id.
   * Mirrors Express GET /attempts/:id.
   */
  async getAttempt(id: number): Promise<AttemptEntity | null> {
    try {
      return await this.attemptRepository.findOne({ where: { attempt_id: id } });
    } catch (error) {
      throw new Error(`Failed to get attempt with id ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Get attempt by user and scenario.
   * Mirrors Express GET /attempts/user/:user_id/scenario/:scenario_id.
   */
  async getUserAttempt(user_id: number, scenario_id: number): Promise<AttemptEntity | null> {
    try {
      return await this.attemptRepository.findOne({ where: { user_id, scenario_id } });
    } catch (error) {
      throw new Error(`Failed to get user attempt: ${(error as Error).message}`);
    }
  }

  /**
   * Upsert best score, keeping the greater score and updating timestamp.
   * Mirrors Express POST /attempts.
   */
  async saveBestScore(user_id: number, payload: CreateAttemptDto): Promise<AttemptEntity | null> {
    const { scenario_id, score } = payload;
    try {
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

      const rows = await this.attemptRepository.query(
        `
        SELECT attempt_id, user_id, scenario_id, score, completed_at
        FROM attempts
        WHERE user_id = ? AND scenario_id = ?
        LIMIT 1;
      `,
        [user_id, scenario_id],
      );
      return rows?.[0] ?? null;
    } catch (error) {
      throw new Error('Failed to save best score: ' + (error as Error).message);
    }
  }

  /**
   * Attempts by user and level (scenario_id + score).
   * Mirrors Express GET /attempts/user/:user_id/level/:level_id.
   */
  async getUserAttemptsByLevel(
    user_id: number,
    level_id: number,
  ): Promise<AttemptLevelScore[]> {
    try {
      const rows = await this.attemptRepository.query(
        `
        SELECT a.scenario_id, a.score
        FROM attempts a
        JOIN scenarios s ON a.scenario_id = s.scenario_id
        WHERE a.user_id = ? AND s.level_id = ?;
      `,
        [user_id, level_id],
      );
      return rows;
    } catch (error) {
      throw new Error(`Failed to get attempts by level: ${(error as Error).message}`);
    }
  }
}
