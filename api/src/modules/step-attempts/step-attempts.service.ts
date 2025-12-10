import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StepAttemptEntity } from '../../domain/entities/step-attempt.entity';
import { CreateStepAttemptDto } from './dto/create-step-attempt.dto';

@Injectable()
export class StepAttemptsService {
  constructor(
    @InjectRepository(StepAttemptEntity)
    private readonly stepAttemptRepository: Repository<StepAttemptEntity>,
  ) {}

  async list(): Promise<StepAttemptEntity[]> {
    return this.stepAttemptRepository.find({
      order: { step_attempt_id: 'DESC' },
    });
  }

  async get(id: number): Promise<StepAttemptEntity | null> {
    return this.stepAttemptRepository.findOne({ where: { step_attempt_id: id } });
  }

  async getByAttempt(attempt_id: number): Promise<StepAttemptEntity[]> {
    return this.stepAttemptRepository.find({
      where: { attempt_id },
      order: { step_attempt_id: 'ASC' },
    });
  }

  async create(payload: CreateStepAttemptDto): Promise<StepAttemptEntity> {
    const entity = this.stepAttemptRepository.create(payload);
    return this.stepAttemptRepository.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.stepAttemptRepository.delete({ step_attempt_id: id });
    return (result.affected ?? 0) > 0;
  }
}
