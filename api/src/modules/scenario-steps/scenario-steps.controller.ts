import {
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
import { CreateScenarioStepDto } from './dto/create-scenario-step.dto';
import { StepIdParamDto } from './dto/step-id-param.dto';
import { UpdateScenarioStepDto } from './dto/update-scenario-step.dto';
import { ScenarioStepResponse, ScenarioStepsService } from './scenario-steps.service';

@ApiTags('Scenario Steps')
@Controller('scenario-steps')
export class ScenarioStepsController {
  constructor(private readonly stepsService: ScenarioStepsService) {}

  /**
   * List all scenario steps.
   * Matches Express: GET /scenario-steps.
   */
  @ApiOperation({ summary: 'List scenario steps' })
  @ApiOkResponse({ type: Object, isArray: true })
  @Get()
  async list(): Promise<ScenarioStepResponse[]> {
    return this.stepsService.listScenarioSteps();
  }

  /**
   * Get one step by id.
   * Matches Express: GET /scenario-steps/:id.
   */
  @ApiOperation({ summary: 'Get scenario step by id' })
  @ApiOkResponse({ type: Object })
  @Get(':id')
  async get(@Param() params: StepIdParamDto): Promise<ScenarioStepResponse> {
    const step = await this.stepsService.getScenarioStep(params.id);
    if (!step) {
      throw new NotFoundException({ message: 'Step not found' });
    }
    return step;
  }

  /**
   * Create a step (admin).
   * Matches Express: POST /scenario-steps.
   */
  @ApiOperation({ summary: 'Create scenario step (admin)' })
  @ApiCreatedResponse({ type: Object })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() payload: CreateScenarioStepDto): Promise<ScenarioStepResponse> {
    return this.stepsService.createScenarioStep(payload);
  }

  /**
   * Update a step (admin).
   * Matches Express: PUT /scenario-steps/:id.
   */
  @ApiOperation({ summary: 'Update scenario step (admin)' })
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param() params: StepIdParamDto,
    @Body() payload: UpdateScenarioStepDto,
  ): Promise<ScenarioStepResponse> {
    const updated = await this.stepsService.updateScenarioStep(params.id, payload);
    if (!updated) {
      throw new NotFoundException({ message: 'Step not found' });
    }
    return updated;
  }

  /**
   * Delete a step (admin).
   * Matches Express: DELETE /scenario-steps/:id.
   */
  @ApiOperation({ summary: 'Delete scenario step (admin)' })
  @ApiNoContentResponse()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: StepIdParamDto): Promise<void> {
    const ok = await this.stepsService.deleteScenarioStep(params.id);
    if (!ok) {
      throw new NotFoundException({ message: 'Step not found' });
    }
  }
}
