import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { UserBadgeEntity } from '../../domain/entities/user-badge.entity';
import { UserBadgesController } from './user-badges.controller';
import { UserBadgesService } from './user-badges.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserBadgeEntity])],
  controllers: [UserBadgesController],
  providers: [UserBadgesService],
})
export class UserBadgesModule {}
