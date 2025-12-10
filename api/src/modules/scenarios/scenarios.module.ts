import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { AttemptEntity } from '../../domain/entities/attempt.entity';
import { BadgeEntity } from '../../domain/entities/badge.entity';
import { ScenarioEntity } from '../../domain/entities/scenario.entity';
import { ScenarioStepEntity } from '../../domain/entities/scenario-step.entity';
import { UserBadgeEntity } from '../../domain/entities/user-badge.entity';
import { UserLevelEntity } from '../../domain/entities/user-level.entity';
import { ScenarioStepsModule } from '../scenario-steps/scenario-steps.module';
import { ScenariosController } from './scenarios.controller';
import { ScenariosResolver } from './scenarios.resolver';
import { ScenariosService } from './scenarios.service';

@Module({
  imports: [
    AuthModule,
    ScenarioStepsModule,
    TypeOrmModule.forFeature([
      ScenarioEntity,
      ScenarioStepEntity,
      AttemptEntity,
      BadgeEntity,
      UserBadgeEntity,
      UserLevelEntity,
    ]),
  ],
  controllers: [ScenariosController],
  providers: [ScenariosService, ScenariosResolver],
})
export class ScenariosModule {}
