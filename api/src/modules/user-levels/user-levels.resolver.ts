import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { UserLevelEntity } from '../../domain/entities/user-level.entity';
import { UserLevelsService } from './user-levels.service';

@Resolver(() => UserLevelEntity)
export class UserLevelsResolver {
  constructor(private readonly userLevelsService: UserLevelsService) {}

  /**
   * GraphQL query: userLevelsByUser.
   * Mirrors REST GET /user-levels/by-user/:user_id/levels.
   */
  @Query(() => [UserLevelEntity], { name: 'userLevelsByUser' })
  async userLevelsByUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.userLevelsService.getUserLevels(userId);
  }

  /**
   * GraphQL query: userLevelsByUserLevel (single record).
   * Mirrors REST GET /user-levels/by-user/:user_id/levels/:level_id.
   */
  @Query(() => UserLevelEntity, { name: 'userLevelsByUserLevel' })
  async userLevelsByUserLevel(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('levelId', { type: () => Int }) levelId: number,
  ) {
    const record = await this.userLevelsService.getUserLevel(userId, levelId);
    if (!record) {
      throw new NotFoundException({ message: 'User level not found' });
    }
    return record;
  }
}
