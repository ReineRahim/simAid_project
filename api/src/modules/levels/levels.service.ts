import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelEntity } from '../../domain/entities/level.entity';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(LevelEntity)
    private readonly levelRepository: Repository<LevelEntity>,
  ) {}

  /**
   * Retrieve all levels ordered by difficulty.
   * Mirrors Express: GET /levels.
   */
  async listLevels(): Promise<LevelEntity[]> {
    try {
      return await this.levelRepository.find({
        order: { difficulty_order: 'ASC' },
      });
    } catch (error) {
      throw new Error('Failed to list levels: ' + (error as Error).message);
    }
  }

  /**
   * Retrieve a single level by id.
   * Mirrors Express: GET /levels/:id.
   */
  async getLevel(id: number): Promise<LevelEntity | null> {
    try {
      return await this.levelRepository.findOne({ where: { level_id: id } });
    } catch (error) {
      throw new Error(`Failed to get level with id ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Create a level record.
   * Mirrors Express: POST /levels.
   */
  async createLevel(payload: CreateLevelDto): Promise<LevelEntity> {
    try {
      const entity = this.levelRepository.create(payload);
      return await this.levelRepository.save(entity);
    } catch (error) {
      throw new Error('Failed to create level: ' + (error as Error).message);
    }
  }

  /**
   * Update a level record by id.
   * Mirrors Express: PUT /levels/:id.
   */
  async updateLevel(id: number, payload: UpdateLevelDto): Promise<LevelEntity | null> {
    try {
      const existing = await this.levelRepository.findOne({ where: { level_id: id } });
      if (!existing) return null;
      const merged = this.levelRepository.merge(existing, payload);
      return await this.levelRepository.save(merged);
    } catch (error) {
      throw new Error(`Failed to update level with id ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a level by id.
   * Mirrors Express: DELETE /levels/:id.
   */
  async deleteLevel(id: number): Promise<boolean> {
    try {
      const result = await this.levelRepository.delete({ level_id: id });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete level with id ${id}: ${(error as Error).message}`);
    }
  }
}
