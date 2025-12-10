import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { AttemptEntity } from '../../domain/entities/attempt.entity';
import { AttemptsService, AttemptLevelScore } from './attempts.service';
import { Field, Int as GqlInt, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttemptLevelScoreType implements AttemptLevelScore {
  @Field(() => GqlInt)
  scenario_id: number;

  @Field(() => GqlInt)
  score: number;
}

@Resolver(() => AttemptEntity)
export class AttemptsResolver {
  constructor(private readonly attemptsService: AttemptsService) {}

  /**
   * GraphQL query: attemptsForUserLevel.
   * Mirrors REST GET /attempts/user/:user_id/level/:level_id.
   */
  @Query(() => [AttemptLevelScoreType], { name: 'attemptsForUserLevel' })
  async attemptsForUserLevel(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('levelId', { type: () => Int }) levelId: number,
  ): Promise<AttemptLevelScore[]> {
    return this.attemptsService.getUserAttemptsByLevel(userId, levelId);
  }
}
