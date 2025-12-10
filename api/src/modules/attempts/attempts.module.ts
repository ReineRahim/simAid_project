import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { AttemptEntity } from '../../domain/entities/attempt.entity';
import { AttemptsController } from './attempts.controller';
import { AttemptsResolver } from './attempts.resolver';
import { AttemptsService } from './attempts.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AttemptEntity])],
  controllers: [AttemptsController],
  providers: [AttemptsService, AttemptsResolver],
})
export class AttemptsModule {}
