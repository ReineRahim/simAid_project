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
import { LevelEntity } from '../../domain/entities/level.entity';
import { CreateLevelDto } from './dto/create-level.dto';
import { LevelIdParamDto } from './dto/level-id-param.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { LevelsService } from './levels.service';

@ApiTags('Levels')
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  /**
   * List all levels ordered by difficulty.
   * Matches Express route: GET /levels.
   */
  @ApiOperation({ summary: 'List levels' })
  @ApiOkResponse({ type: LevelEntity, isArray: true })
  @Get()
  async list(): Promise<LevelEntity[]> {
    return this.levelsService.listLevels();
  }

  /**
   * Retrieve a single level by id.
   * Matches Express route: GET /levels/:id.
   */
  @ApiOperation({ summary: 'Get level by id' })
  @ApiOkResponse({ type: LevelEntity })
  @Get(':id')
  async get(@Param() params: LevelIdParamDto): Promise<LevelEntity> {
    const level = await this.levelsService.getLevel(params.id);
    if (!level) {
      throw new NotFoundException({ message: 'Level not found' });
    }
    return level;
  }

  /**
   * Create a level (admin).
   * Matches Express route: POST /levels.
   */
  @ApiOperation({ summary: 'Create level (admin)' })
  @ApiCreatedResponse({ type: LevelEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() payload: CreateLevelDto): Promise<LevelEntity> {
    return this.levelsService.createLevel(payload);
  }

  /**
   * Update a level by id (admin).
   * Matches Express route: PUT /levels/:id.
   */
  @ApiOperation({ summary: 'Update level (admin)' })
  @ApiOkResponse({ type: LevelEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param() params: LevelIdParamDto,
    @Body() payload: UpdateLevelDto,
  ): Promise<LevelEntity> {
    const updated = await this.levelsService.updateLevel(params.id, payload);
    if (!updated) {
      throw new NotFoundException({ message: 'Level not found' });
    }
    return updated;
  }

  /**
   * Delete a level by id (admin).
   * Matches Express route: DELETE /levels/:id.
   */
  @ApiOperation({ summary: 'Delete level (admin)' })
  @ApiNoContentResponse()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: LevelIdParamDto): Promise<void> {
    const ok = await this.levelsService.deleteLevel(params.id);
    if (!ok) {
      throw new NotFoundException({ message: 'Level not found' });
    }
  }
}
