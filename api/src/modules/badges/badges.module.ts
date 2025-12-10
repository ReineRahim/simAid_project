import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { BadgeEntity } from '../../domain/entities/badge.entity';
import { BadgesController } from './badges.controller';
import { BadgesResolver } from './badges.resolver';
import { BadgesService } from './badges.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([BadgeEntity])],
  controllers: [BadgesController],
  providers: [BadgesService, BadgesResolver],
})
export class BadgesModule {}
