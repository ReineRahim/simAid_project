import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { UserLevelEntity } from '../../domain/entities/user-level.entity';
import { UserLevelsController } from './user-levels.controller';
import { UserLevelsResolver } from './user-levels.resolver';
import { UserLevelsService } from './user-levels.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserLevelEntity])],
  controllers: [UserLevelsController],
  providers: [UserLevelsService, UserLevelsResolver],
})
export class UserLevelsModule {}
