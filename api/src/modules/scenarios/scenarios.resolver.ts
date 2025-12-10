import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ScenarioEntity } from '../../domain/entities/scenario.entity';
import { ScenarioStepEntity } from '../../domain/entities/scenario-step.entity';
import { ScenariosService } from './scenarios.service';
import { ScenarioStepsService } from '../scenario-steps/scenario-steps.service';

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class LevelProgress {
  @Field(() => Int)
  level_id: number;

  @Field()
  completed: boolean;

  @Field({ nullable: true })
  next_level_unlocked?: number;

  @Field({ nullable: true })
  perfect_in_level?: number;

  @Field({ nullable: true })
  total_in_level?: number;
}

@ObjectType()
class AwardedBadge {
  @Field(() => Int)
  badge_id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  icon_url?: string;
}

@ObjectType()
class SubmitScenarioResult {
  @Field(() => Int)
  score: number;

  @Field()
  all_correct: boolean;

  @Field(() => Int)
  level_id: number;

  @Field(() => Int)
  scenario_id: number;

  @Field(() => LevelProgress)
  level_progress: LevelProgress;

  @Field(() => AwardedBadge, { nullable: true })
  awarded_badge?: AwardedBadge;

  @Field(() => ScenarioEntity, { nullable: true })
  updated_scenario?: ScenarioEntity;
}

@Resolver(() => ScenarioEntity)
export class ScenariosResolver {
  constructor(
    private readonly scenariosService: ScenariosService,
    private readonly scenarioStepsService: ScenarioStepsService,
  ) {}

  /**
   * GraphQL query: list all scenarios.
   * Mirrors REST GET /scenarios.
   */
  @Query(() => [ScenarioEntity], { name: 'scenarios' })
  async listScenarios(): Promise<ScenarioEntity[]> {
    return this.scenariosService.listScenarios();
  }

  /**
   * GraphQL query: list scenarios by level.
   * Mirrors REST GET /scenarios/level/:levelId.
   */
  @Query(() => [ScenarioEntity], { name: 'scenariosByLevel' })
  async listByLevel(@Args('levelId', { type: () => Int }) levelId: number): Promise<ScenarioEntity[]> {
    return this.scenariosService.listByLevel(levelId);
  }

  /**
   * GraphQL query: get scenario by id with steps.
   * Mirrors REST GET /scenarios/:id.
   */
  @Query(() => ScenarioEntity, { name: 'scenario' })
  async getScenario(@Args('id', { type: () => Int }) id: number): Promise<ScenarioEntity> {
    const scenario = await this.scenariosService.getScenario(id);
    if (!scenario) {
      throw new NotFoundException({ message: 'Scenario not found' });
    }
    const steps: ScenarioStepEntity[] = await this.scenariosService.getStepEntitiesByScenario(id);
    return { ...scenario, steps };
  }

  /**
   * GraphQL mutation: submitScenario (auth).
   * Mirrors REST POST /scenarios/:id/submit.
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => SubmitScenarioResult, { name: 'submitScenario' })
  async submitScenario(
    @Args('scenarioId', { type: () => Int }) scenarioId: number,
    @Args({ name: 'userAnswers', type: () => [String] }) userAnswers: string[],
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<SubmitScenarioResult> {
    if (!userAnswers || !Array.isArray(userAnswers)) {
      throw new NotFoundException({ message: 'userAnswers must be an array.' });
    }

    const scenario = await this.scenariosService.getScenario(scenarioId);
    if (!scenario) {
      throw new NotFoundException({ message: 'Scenario not found' });
    }

    const steps = await this.scenarioStepsService.getStepsByScenario(scenarioId);
    if (!steps || steps.length === 0) {
      throw new NotFoundException({ message: 'No steps found for this scenario.' });
    }

    const total = steps.length;
    let correctCount = 0;

    steps
      .slice()
      .sort((a, b) => Number(a.step_order) - Number(b.step_order))
      .forEach((step, i) => {
        const picked = (userAnswers[i] || '').toString().toUpperCase();
        const correct = (step.correct_action || '').toString().toUpperCase();
        if (picked && picked === correct) correctCount += 1;
      });

    const score = Math.round((correctCount / total) * 100);
    const allCorrect = correctCount === total;

    const result: any = {
      score,
      all_correct: allCorrect,
      level_id: scenario.level_id,
      scenario_id: scenarioId,
    };

    await this.scenariosService.upsertBestScore({
      user_id: userId,
      scenario_id: scenarioId,
      score,
      all_correct: allCorrect,
    });

    const perfectInLevel = await this.scenariosService.countPerfectByUserInLevel(
      userId,
      scenario.level_id,
    );
    const totalInLevel = await this.scenariosService.countByLevel(scenario.level_id);

    const completedThisLevel = totalInLevel > 0 && perfectInLevel === totalInLevel;

    await this.scenariosService.upsertUserLevelProgress({
      user_id: userId,
      level_id: scenario.level_id,
      unlocked: true,
      completed: completedThisLevel,
    });

    if (completedThisLevel) {
      const nextLevelId = scenario.level_id + 1;
      if (scenario.level_id < 6) {
        await this.scenariosService.upsertUserLevelProgress({
          user_id: userId,
          level_id: nextLevelId,
          unlocked: true,
          completed: false,
        });
      }

      result.level_progress = {
        level_id: scenario.level_id,
        completed: true,
        next_level_unlocked: nextLevelId,
      };

      const badge = await this.scenariosService.findBadgeByLevel(scenario.level_id);
      if (badge) {
        const existing = await this.scenariosService.findUserBadge(userId, badge.badge_id);
        if (!existing) {
          await this.scenariosService.createUserBadge(userId, badge.badge_id);
          result.awarded_badge = {
            badge_id: badge.badge_id,
            name: badge.name,
            description: badge.description,
            icon_url: badge.icon_url,
          };
        }
      }
    } else {
      result.level_progress = {
        level_id: scenario.level_id,
        completed: false,
        perfect_in_level: perfectInLevel,
        total_in_level: totalInLevel,
      };
    }

    const updatedScenario = await this.scenariosService.getScenario(scenarioId);
    result.updated_scenario = updatedScenario;

    return result;
  }
}
