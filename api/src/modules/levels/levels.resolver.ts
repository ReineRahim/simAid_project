import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { LevelEntity } from '../../domain/entities/level.entity';
import { LevelsService } from './levels.service';

@Resolver(() => LevelEntity)
export class LevelsResolver {
  constructor(private readonly levelsService: LevelsService) {}

  /**
   * GraphQL query: list all levels (read-only).
   * Mirrors REST GET /levels.
   */
  @Query(() => [LevelEntity], { name: 'levels' })
  async listLevels(): Promise<LevelEntity[]> {
    return this.levelsService.listLevels();
  }

  /**
   * GraphQL query: get a level by id (read-only).
   * Mirrors REST GET /levels/:id.
   */
  @Query(() => LevelEntity, { name: 'level' })
  async getLevel(@Args('id', { type: () => Int }) id: number): Promise<LevelEntity> {
    const level = await this.levelsService.getLevel(id);
    if (!level) {
      throw new NotFoundException({ message: 'Level not found' });
    }
    return level;
  }
}
