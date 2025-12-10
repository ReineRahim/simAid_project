import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { BadgeEntity } from '../../domain/entities/badge.entity';
import { BadgesService } from './badges.service';

@Resolver(() => BadgeEntity)
export class BadgesResolver {
  constructor(private readonly badgesService: BadgesService) {}

  /**
   * GraphQL query: badges list.
   * Mirrors REST GET /badges.
   */
  @Query(() => [BadgeEntity], { name: 'badges' })
  async list(): Promise<BadgeEntity[]> {
    return this.badgesService.listBadges();
  }

  /**
   * GraphQL query: badge by id.
   * Mirrors REST GET /badges/:id.
   */
  @Query(() => BadgeEntity, { name: 'badge' })
  async get(@Args('id', { type: () => Int }) id: number): Promise<BadgeEntity> {
    const badge = await this.badgesService.getBadge(id);
    if (!badge) {
      throw new NotFoundException({ message: 'Badge not found' });
    }
    return badge;
  }
}
