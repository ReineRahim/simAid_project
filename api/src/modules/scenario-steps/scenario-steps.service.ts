import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenarioStepEntity } from '../../domain/entities/scenario-step.entity';
import { CreateScenarioStepDto } from './dto/create-scenario-step.dto';
import { UpdateScenarioStepDto } from './dto/update-scenario-step.dto';

export type ScenarioStepResponse = {
  step_id: number;
  scenario_id: number;
  step_order: number;
  question_text: string;
  options: { A: string; B: string; C: string; D: string };
  correct_action: string;
  feedback_message?: string | null;
};

@Injectable()
export class ScenarioStepsService {
  constructor(
    @InjectRepository(ScenarioStepEntity)
    private readonly stepRepository: Repository<ScenarioStepEntity>,
  ) {}

  /**
   * List all scenario steps ordered by scenario and step.
   * Mirrors Express GET /scenario-steps.
   */
  async listScenarioSteps(): Promise<ScenarioStepResponse[]> {
    try {
      const steps = await this.stepRepository.find({
        order: { scenario_id: 'ASC', step_order: 'ASC' },
      });
      return steps.map(ScenarioStepsService.toResponse);
    } catch (error) {
      throw new Error('Failed to list scenario steps: ' + (error as Error).message);
    }
  }

  /**
   * Get a single step by id.
   * Mirrors Express GET /scenario-steps/:id.
   */
  async getScenarioStep(id: number): Promise<ScenarioStepResponse | null> {
    try {
      const step = await this.stepRepository.findOne({ where: { step_id: id } });
      return step ? ScenarioStepsService.toResponse(step) : null;
    } catch (error) {
      throw new Error(`Failed to get scenario step with id ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Get steps for a scenario ordered by step_order.
   * Used by scenarios controller and GraphQL.
   */
  async getStepsByScenario(scenario_id: number): Promise<ScenarioStepResponse[]> {
    try {
      const steps = await this.stepRepository.find({
        where: { scenario_id },
        order: { step_order: 'ASC' },
      });
      return steps.map(ScenarioStepsService.toResponse);
    } catch (error) {
      throw new Error(
        `Failed to get steps for scenario ${scenario_id}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Create a step.
   * Mirrors Express POST /scenario-steps.
   */
  async createScenarioStep(payload: CreateScenarioStepDto): Promise<ScenarioStepResponse> {
    try {
      const entity = this.stepRepository.create(payload);
      const saved = await this.stepRepository.save(entity);
      return ScenarioStepsService.toResponse(saved);
    } catch (error) {
      throw new Error('Failed to create scenario step: ' + (error as Error).message);
    }
  }

  /**
   * Update a step by id.
   * Mirrors Express PUT /scenario-steps/:id.
   */
  async updateScenarioStep(
    id: number,
    payload: UpdateScenarioStepDto,
  ): Promise<ScenarioStepResponse | null> {
    try {
      const existing = await this.stepRepository.findOne({ where: { step_id: id } });
      if (!existing) return null;
      const merged = this.stepRepository.merge(existing, payload);
      const saved = await this.stepRepository.save(merged);
      return ScenarioStepsService.toResponse(saved);
    } catch (error) {
      throw new Error(`Failed to update scenario step with id ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a step by id.
   * Mirrors Express DELETE /scenario-steps/:id.
   */
  async deleteScenarioStep(id: number): Promise<boolean> {
    try {
      const result = await this.stepRepository.delete({ step_id: id });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete scenario step with id ${id}: ${(error as Error).message}`);
    }
  }

  private static toResponse(step: ScenarioStepEntity): ScenarioStepResponse {
    return {
      step_id: step.step_id,
      scenario_id: step.scenario_id,
      step_order: step.step_order,
      question_text: step.question_text,
      options: {
        A: step.option_a,
        B: step.option_b,
        C: step.option_c,
        D: step.option_d,
      },
      correct_action: step.correct_action,
      feedback_message: step.feedback_message ?? null,
    };
  }
}
