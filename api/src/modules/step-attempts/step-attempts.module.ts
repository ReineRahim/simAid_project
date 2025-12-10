import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { StepAttemptEntity } from '../../domain/entities/step-attempt.entity';
import { StepAttemptsController } from './step-attempts.controller';
import { StepAttemptsService } from './step-attempts.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([StepAttemptEntity])],
  controllers: [StepAttemptsController],
  providers: [StepAttemptsService],
})
export class StepAttemptsModule {}
