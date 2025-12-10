import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { LevelEntity } from '../../domain/entities/level.entity';
import { LevelsController } from './levels.controller';
import { LevelsResolver } from './levels.resolver';
import { LevelsService } from './levels.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([LevelEntity])],
  controllers: [LevelsController],
  providers: [LevelsService, LevelsResolver],
  exports: [LevelsService],
})
export class LevelsModule {}
