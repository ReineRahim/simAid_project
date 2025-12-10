import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { ScenarioStepEntity } from '../../domain/entities/scenario-step.entity';
import { ScenarioStepsController } from './scenario-steps.controller';
import { ScenarioStepsService } from './scenario-steps.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ScenarioStepEntity])],
  controllers: [ScenarioStepsController],
  providers: [ScenarioStepsService],
  exports: [ScenarioStepsService],
})
export class ScenarioStepsModule {}
