import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { AttemptIdParamDto } from './dto/attempt-id-param.dto';
import { UserScenarioParamDto } from './dto/user-scenario-param.dto';
import { UserLevelParamDto } from './dto/user-level-param.dto';
import { AttemptsService } from './attempts.service';
import { AttemptEntity } from '../../domain/entities/attempt.entity';

@ApiTags('Attempts')
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  /**
   * List all attempts (admin/debug).
   * Matches Express: GET /attempts.
   */
  @ApiOperation({ summary: 'List attempts' })
  @ApiOkResponse({ type: AttemptEntity, isArray: true })
  @Get()
  async list(): Promise<AttemptEntity[]> {
    return this.attemptsService.listAttempts();
  }

  /**
   * Get attempt by id.
   * Matches Express: GET /attempts/:id.
   */
  @ApiOperation({ summary: 'Get attempt by id' })
  @ApiOkResponse({ type: AttemptEntity })
  @Get(':id')
  async get(@Param() params: AttemptIdParamDto): Promise<AttemptEntity> {
    const attempt = await this.attemptsService.getAttempt(params.id);
    if (!attempt) {
      throw new NotFoundException({ message: 'Attempt not found' });
    }
    return attempt;
  }

  /**
   * Get a user's attempt for a scenario.
   * Matches Express: GET /attempts/user/:user_id/scenario/:scenario_id.
   */
  @ApiOperation({ summary: 'Get attempt by user and scenario' })
  @ApiOkResponse({ type: AttemptEntity })
  @Get('user/:user_id/scenario/:scenario_id')
  async getUserAttempt(@Param() params: UserScenarioParamDto): Promise<AttemptEntity> {
    const attempt = await this.attemptsService.getUserAttempt(
      params.user_id,
      params.scenario_id,
    );
    if (!attempt) {
      throw new NotFoundException({ message: 'No attempt found' });
    }
    return attempt;
  }

  /**
   * Get attempts by user for a level.
   * Matches Express: GET /attempts/user/:user_id/level/:level_id.
   */
  @ApiOperation({ summary: 'Get attempts by user and level' })
  @ApiOkResponse({ type: Object, isArray: true })
  @Get('user/:user_id/level/:level_id')
  async getUserAttemptsByLevel(@Param() params: UserLevelParamDto) {
    return this.attemptsService.getUserAttemptsByLevel(params.user_id, params.level_id);
  }

  /**
   * Upsert best attempt for a user (auth). Body must not include user_id.
   * Matches Express: POST /attempts.
   */
  @ApiOperation({ summary: 'Create/update attempt (auth, user_id from JWT)' })
  @ApiCreatedResponse({ type: AttemptEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateAttemptDto, @Req() req: Request) {
    const rawUserId = (req as any)?.user?.userId ?? (req as any)?.user?.id;
    const userId = Number(rawUserId);
    const attempt = await this.attemptsService.saveBestScore(userId, payload);
    return attempt;
  }
}
