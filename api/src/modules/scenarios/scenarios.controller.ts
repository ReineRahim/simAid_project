import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ScenarioStepsService } from '../scenario-steps/scenario-steps.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { ScenarioIdParamDto } from './dto/scenario-id-param.dto';
import { SubmitScenarioDto } from './dto/submit-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { ScenariosService } from './scenarios.service';
import { ScenarioEntity } from '../../domain/entities/scenario.entity';
import { Request } from 'express';

@ApiTags('Scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(
    private readonly scenariosService: ScenariosService,
    private readonly scenarioStepsService: ScenarioStepsService,
  ) {}

  /**
   * List all scenarios.
   * Matches Express: GET /scenarios.
   */
  @ApiOperation({ summary: 'List scenarios' })
  @ApiOkResponse({ type: ScenarioEntity, isArray: true })
  @Get()
  async list(): Promise<ScenarioEntity[]> {
    return this.scenariosService.listScenarios();
  }

  /**
   * List scenarios by level.
   * Matches Express: GET /scenarios/level/:levelId.
   */
  @ApiOperation({ summary: 'List scenarios by level' })
  @ApiOkResponse({ type: ScenarioEntity, isArray: true })
  @Get('level/:levelId')
  async listByLevel(@Param('levelId') levelIdParam: string): Promise<ScenarioEntity[]> {
    const levelId = Number(levelIdParam);
    if (!levelId || Number.isNaN(levelId)) {
      // Match Express response
      throw new BadRequestException({ message: 'Invalid level ID' });
    }
    return this.scenariosService.listByLevel(levelId);
  }

  /**
   * Get a scenario with steps.
   * Matches Express: GET /scenarios/:id.
   */
  @ApiOperation({ summary: 'Get scenario by id (with steps)' })
  @ApiOkResponse({ type: Object })
  @Get(':id')
  async get(
    @Param() params: ScenarioIdParamDto,
  ): Promise<ScenarioEntity & { steps: unknown[] }> {
    const scenario = await this.scenariosService.getScenario(params.id);
    if (!scenario) {
      throw new NotFoundException({ message: 'Scenario not found' });
    }
    const steps = await this.scenarioStepsService.getStepsByScenario(params.id);
    return { ...scenario, steps };
  }

  /**
   * Create scenario (admin).
   * Matches Express: POST /scenarios.
   */
  @ApiOperation({ summary: 'Create scenario (admin)' })
  @ApiCreatedResponse({ type: ScenarioEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() payload: CreateScenarioDto): Promise<ScenarioEntity> {
    return this.scenariosService.createScenario(payload);
  }

  /**
   * Update scenario (admin).
   * Matches Express: PUT /scenarios/:id.
   */
  @ApiOperation({ summary: 'Update scenario (admin)' })
  @ApiOkResponse({ type: ScenarioEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param() params: ScenarioIdParamDto,
    @Body() payload: UpdateScenarioDto,
  ): Promise<ScenarioEntity> {
    const updated = await this.scenariosService.updateScenario(params.id, payload);
    if (!updated) {
      throw new NotFoundException({ message: 'Scenario not found' });
    }
    return updated;
  }

  /**
   * Delete scenario (admin).
   * Matches Express: DELETE /scenarios/:id.
   */
  @ApiOperation({ summary: 'Delete scenario (admin)' })
  @ApiNoContentResponse()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: ScenarioIdParamDto): Promise<void> {
    const ok = await this.scenariosService.deleteScenario(params.id);
    if (!ok) {
      throw new NotFoundException({ message: 'Scenario not found' });
    }
  }

  /**
   * Submit scenario answers (auth).
   * Matches Express: POST /scenarios/:id/submit.
   */
  @ApiOperation({ summary: 'Submit scenario answers' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  @ApiOkResponse({ type: Object })
  async submit(
    @Param() params: ScenarioIdParamDto,
    @Body() payload: any,
    @Req() req: Request,
  ) {
    const { userAnswers } = payload;
    const scenarioId = params.id;

    if (!userAnswers || !Array.isArray(userAnswers)) {
      throw new BadRequestException({ message: 'userAnswers must be an array.' });
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

    const userId = (req.user as any)?.id;
    if (userId) {
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
    }

    return result;
  }
}
