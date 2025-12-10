import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBadgeEntity } from '../../domain/entities/user-badge.entity';
import { CreateUserBadgeDto } from './dto/create-user-badge.dto';
import { UpdateUserBadgeDto } from './dto/update-user-badge.dto';
import { UserBadgeQueryDto } from './dto/user-badge-query.dto';

@Injectable()
export class UserBadgesService {
  constructor(
    @InjectRepository(UserBadgeEntity)
    private readonly userBadgeRepository: Repository<UserBadgeEntity>,
  ) {}

  async listUserBadges(query?: UserBadgeQueryDto): Promise<UserBadgeEntity[]> {
    const where: any = {};
    if (query?.user_id) where.user_id = query.user_id;
    if (query?.badge_id) where.badge_id = query.badge_id;

    return this.userBadgeRepository.find({
      where: Object.keys(where).length ? where : undefined,
      order: { user_badge_id: 'DESC' },
    });
  }

  async getUserBadge(id: number): Promise<UserBadgeEntity | null> {
    return this.userBadgeRepository.findOne({ where: { user_badge_id: id } });
  }

  async createUserBadge(payload: CreateUserBadgeDto): Promise<UserBadgeEntity> {
    const entity = this.userBadgeRepository.create(payload);
    return this.userBadgeRepository.save(entity);
  }

  async updateUserBadge(
    id: number,
    payload: UpdateUserBadgeDto,
  ): Promise<UserBadgeEntity | null> {
    const existing = await this.userBadgeRepository.findOne({ where: { user_badge_id: id } });
    if (!existing) return null;
    const merged = this.userBadgeRepository.merge(existing, payload);
    return this.userBadgeRepository.save(merged);
  }

  async deleteUserBadge(id: number): Promise<boolean> {
    const result = await this.userBadgeRepository.delete({ user_badge_id: id });
    return (result.affected ?? 0) > 0;
  }
}
