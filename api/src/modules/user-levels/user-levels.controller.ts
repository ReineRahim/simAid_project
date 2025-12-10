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
  Query,
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
import { UserLevelEntity } from '../../domain/entities/user-level.entity';
import { CreateUserLevelDto } from './dto/create-user-level.dto';
import { UpdateUserLevelDto } from './dto/update-user-level.dto';
import { UserLevelIdParamDto } from './dto/user-level-id-param.dto';
import { UserLevelQueryDto } from './dto/user-level-query.dto';
import { UserLevelUpsertDto } from './dto/user-level-upsert.dto';
import { UserLevelsService } from './user-levels.service';

@ApiTags('User Levels')
@Controller('user-levels')
export class UserLevelsController {
  constructor(private readonly userLevelsService: UserLevelsService) {}

  /**
   * List user-levels (optional filters user_id/level_id).
   * Mirrors Express: GET /user-levels with query filters.
   */
  @ApiOperation({ summary: 'List user levels (with optional filters)' })
  @ApiOkResponse({ type: UserLevelEntity, isArray: true })
  @Get()
  async list(@Query() query: UserLevelQueryDto): Promise<UserLevelEntity | UserLevelEntity[]> {
    const { user_id, level_id } = query;

    if (user_id && level_id) {
      const row = await this.userLevelsService.getUserLevel(user_id, level_id);
      if (!row) {
        throw new NotFoundException({ message: 'User level not found' });
      }
      return row;
    }

    if (user_id) {
      return this.userLevelsService.getUserLevels(user_id);
    }

    return this.userLevelsService.listUserLevels();
  }

  /**
   * Get user-level by id.
   * Mirrors Express: GET /user-levels/:id.
   */
  @ApiOperation({ summary: 'Get user level by id' })
  @ApiOkResponse({ type: UserLevelEntity })
  @Get(':id')
  async getById(@Param() params: UserLevelIdParamDto): Promise<UserLevelEntity> {
    const level = await this.userLevelsService.getById(params.id);
    if (!level) {
      throw new NotFoundException({ message: 'User level not found' });
    }
    return level;
  }

  /**
   * List user-levels for a user.
   * Mirrors Express: GET /user-levels/by-user/:user_id/levels.
   */
  @ApiOperation({ summary: 'List user levels for user' })
  @ApiOkResponse({ type: UserLevelEntity, isArray: true })
  @Get('by-user/:user_id/levels')
  async listByUser(@Param('user_id') userIdParam: string): Promise<UserLevelEntity[]> {
    const user_id = Number(userIdParam);
    return this.userLevelsService.getUserLevels(user_id);
  }

  /**
   * Get user-level for user and level.
   * Mirrors Express: GET /user-levels/by-user/:user_id/levels/:level_id.
   */
  @ApiOperation({ summary: 'Get user level by user and level' })
  @ApiOkResponse({ type: UserLevelEntity })
  @Get('by-user/:user_id/levels/:level_id')
  async getByUserAndLevel(
    @Param('user_id') userIdParam: string,
    @Param('level_id') levelIdParam: string,
  ): Promise<UserLevelEntity> {
    const user_id = Number(userIdParam);
    const level_id = Number(levelIdParam);
    const row = await this.userLevelsService.getUserLevel(user_id, level_id);
    if (!row) {
      throw new NotFoundException({ message: 'User level not found' });
    }
    return row;
  }

  /**
   * Create user-level.
   * Mirrors Express: POST /user-levels.
   */
  @ApiOperation({ summary: 'Create user level' })
  @ApiCreatedResponse({ type: UserLevelEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() payload: CreateUserLevelDto): Promise<UserLevelEntity> {
    return this.userLevelsService.createUserLevel(payload);
  }

  /**
   * Update user-level by id.
   * Mirrors Express: PUT /user-levels/:id.
   */
  @ApiOperation({ summary: 'Update user level' })
  @ApiOkResponse({ type: UserLevelEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param() params: UserLevelIdParamDto,
    @Body() payload: UpdateUserLevelDto,
  ): Promise<UserLevelEntity> {
    const updated = await this.userLevelsService.updateUserLevelStatus(params.id, payload);
    if (!updated) {
      throw new NotFoundException({ message: 'User level not found' });
    }
    return updated;
  }

  /**
   * Delete user-level by id.
   * Mirrors Express: DELETE /user-levels/:id.
   */
  @ApiOperation({ summary: 'Delete user level' })
  @ApiNoContentResponse()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: UserLevelIdParamDto): Promise<void> {
    const ok = await this.userLevelsService.deleteUserLevel(params.id);
    if (!ok) {
      throw new NotFoundException({ message: 'User level not found' });
    }
  }

  /**
   * Upsert user-level by user + level.
   * Mirrors Express: POST /user-levels/upsert.
   */
  @ApiOperation({ summary: 'Upsert user level' })
  @ApiOkResponse({ type: UserLevelEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Post('upsert')
  async upsert(@Body() payload: UserLevelUpsertDto): Promise<UserLevelEntity> {
    return this.userLevelsService.upsertUserLevelProgress(payload);
  }
}
