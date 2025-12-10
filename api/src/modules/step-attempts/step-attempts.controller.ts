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
import { StepAttemptEntity } from '../../domain/entities/step-attempt.entity';
import { AttemptIdParamDto } from './dto/attempt-id-param.dto';
import { CreateStepAttemptDto } from './dto/create-step-attempt.dto';
import { StepAttemptIdParamDto } from './dto/step-attempt-id-param.dto';
import { StepAttemptsService } from './step-attempts.service';

@ApiTags('Step Attempts')
@Controller('step-attempts')
export class StepAttemptsController {
  constructor(private readonly stepAttemptsService: StepAttemptsService) {}

  /**
   * List all step attempts.
   * Mirrors Express: GET /step-attempts.
   */
  @ApiOperation({ summary: 'List step attempts' })
  @ApiOkResponse({ type: StepAttemptEntity, isArray: true })
  @Get()
  async list(): Promise<StepAttemptEntity[]> {
    return this.stepAttemptsService.list();
  }

  /**
   * Get step attempt by id.
   * Mirrors Express: GET /step-attempts/:id.
   */
  @ApiOperation({ summary: 'Get step attempt by id' })
  @ApiOkResponse({ type: StepAttemptEntity })
  @Get(':id')
  async get(@Param() params: StepAttemptIdParamDto): Promise<StepAttemptEntity> {
    const attempt = await this.stepAttemptsService.get(params.id);
    if (!attempt) {
      throw new NotFoundException({ message: 'Step attempt not found' });
    }
    return attempt;
  }

  /**
   * Get step attempts by parent attempt id.
   * Mirrors Express: GET /step-attempts/attempt/:attempt_id.
   */
  @ApiOperation({ summary: 'List step attempts by attempt id' })
  @ApiOkResponse({ type: StepAttemptEntity, isArray: true })
  @Get('attempt/:attempt_id')
  async getByAttempt(@Param() params: AttemptIdParamDto): Promise<StepAttemptEntity[]> {
    return this.stepAttemptsService.getByAttempt(params.attempt_id);
  }

  /**
   * Create step attempt (auth).
   * Mirrors Express: POST /step-attempts.
   */
  @ApiOperation({ summary: 'Create step attempt (auth)' })
  @ApiCreatedResponse({ type: StepAttemptEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() payload: CreateStepAttemptDto): Promise<StepAttemptEntity> {
    return this.stepAttemptsService.create(payload);
  }

  /**
   * Delete step attempt (auth).
   * Mirrors Express: DELETE /step-attempts/:id.
   */
  @ApiOperation({ summary: 'Delete step attempt (auth)' })
  @ApiNoContentResponse()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: StepAttemptIdParamDto): Promise<void> {
    const ok = await this.stepAttemptsService.delete(params.id);
    if (!ok) {
      throw new NotFoundException({ message: 'Step attempt not found' });
    }
  }
}
