import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLevelEntity } from '../../domain/entities/user-level.entity';
import { CreateUserLevelDto } from './dto/create-user-level.dto';
import { UpdateUserLevelDto } from './dto/update-user-level.dto';
import { UserLevelUpsertDto } from './dto/user-level-upsert.dto';

@Injectable()
export class UserLevelsService {
  constructor(
    @InjectRepository(UserLevelEntity)
    private readonly userLevelRepository: Repository<UserLevelEntity>,
  ) {}

  /**
   * List all user-level records.
   * Mirrors Express GET /user-levels.
   */
  async listUserLevels(): Promise<UserLevelEntity[]> {
    const records = await this.userLevelRepository.find({
      order: { user_id: 'ASC', level_id: 'ASC' },
    });
    return records;
  }

  /**
   * Get user-level by ID.
   * Mirrors Express GET /user-levels/:id.
   */
  async getById(id: number): Promise<UserLevelEntity | null> {
    return this.userLevelRepository.findOne({ where: { user_level_id: id } });
  }

  /**
   * Get all levels for a user.
   * Mirrors Express GET /user-levels/by-user/:user_id/levels.
   */
  async getUserLevels(user_id: number): Promise<UserLevelEntity[]> {
    return this.userLevelRepository.find({
      where: { user_id },
      order: { level_id: 'ASC' },
    });
  }

  /**
   * Get a single user-level by user + level.
   * Mirrors Express GET /user-levels/by-user/:user_id/levels/:level_id.
   */
  async getUserLevel(user_id: number, level_id: number): Promise<UserLevelEntity | null> {
    return this.userLevelRepository.findOne({ where: { user_id, level_id } });
  }

  /**
   * Create user-level record.
   * Mirrors Express POST /user-levels.
   */
  async createUserLevel(payload: CreateUserLevelDto): Promise<UserLevelEntity> {
    const entity = this.userLevelRepository.create({
      ...payload,
      unlocked: payload.unlocked ?? false,
      completed: payload.completed ?? false,
    });
    return this.userLevelRepository.save(entity);
  }

  /**
   * Update unlocked/completed fields by id.
   * Mirrors Express PUT /user-levels/:id.
   */
  async updateUserLevelStatus(
    id: number,
    payload: UpdateUserLevelDto,
  ): Promise<UserLevelEntity | null> {
    const existing = await this.userLevelRepository.findOne({ where: { user_level_id: id } });
    if (!existing) return null;
    const merged = this.userLevelRepository.merge(existing, payload);
    return this.userLevelRepository.save(merged);
  }

  /**
   * Delete user-level by id.
   * Mirrors Express DELETE /user-levels/:id.
   */
  async deleteUserLevel(id: number): Promise<boolean> {
    const result = await this.userLevelRepository.delete({ user_level_id: id });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Upsert progress by user + level.
   * Mirrors Express POST /user-levels/upsert.
   */
  async upsertUserLevelProgress(payload: UserLevelUpsertDto): Promise<UserLevelEntity> {
    const { user_id, level_id, unlocked, completed } = payload;
    await this.userLevelRepository.query(
      `
      INSERT INTO user_levels (user_id, level_id, unlocked, completed)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        unlocked = VALUES(unlocked),
        completed = VALUES(completed);
    `,
      [user_id, level_id, unlocked ?? false, completed ?? false],
    );
    const record = await this.getUserLevel(user_id, level_id);
    // record should exist after upsert
    return record!;
  }
}
