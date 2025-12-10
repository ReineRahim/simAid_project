import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeEntity } from '../../domain/entities/badge.entity';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(BadgeEntity)
    private readonly badgeRepository: Repository<BadgeEntity>,
  ) {}

  async listBadges(): Promise<BadgeEntity[]> {
    try {
      return this.badgeRepository.find();
    } catch (error) {
      throw new Error('Failed to list badges: ' + (error as Error).message);
    }
  }

  async getBadge(id: number): Promise<BadgeEntity | null> {
    try {
      return this.badgeRepository.findOne({ where: { badge_id: id } });
    } catch (error) {
      throw new Error(`Failed to get badge with id ${id}: ${(error as Error).message}`);
    }
  }

  async createBadge(payload: CreateBadgeDto): Promise<BadgeEntity> {
    try {
      const entity = this.badgeRepository.create(payload);
      return this.badgeRepository.save(entity);
    } catch (error) {
      throw new Error('Failed to create badge: ' + (error as Error).message);
    }
  }

  async updateBadge(id: number, payload: UpdateBadgeDto): Promise<BadgeEntity | null> {
    try {
      const existing = await this.badgeRepository.findOne({ where: { badge_id: id } });
      if (!existing) return null;
      const merged = this.badgeRepository.merge(existing, payload);
      return this.badgeRepository.save(merged);
    } catch (error) {
      throw new Error(`Failed to update badge with id ${id}: ${(error as Error).message}`);
    }
  }

  async deleteBadge(id: number): Promise<boolean> {
    try {
      const result = await this.badgeRepository.delete({ badge_id: id });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete badge with id ${id}: ${(error as Error).message}`);
    }
  }
}
