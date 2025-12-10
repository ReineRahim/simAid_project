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
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserBadgeEntity } from '../../domain/entities/user-badge.entity';
import { CreateUserBadgeDto } from './dto/create-user-badge.dto';
import { UpdateUserBadgeDto } from './dto/update-user-badge.dto';
import { UserBadgeIdParamDto } from './dto/user-badge-id-param.dto';
import { UserBadgesService } from './user-badges.service';
import { UserBadgeQueryDto } from './dto/user-badge-query.dto';

@ApiTags('User Badges')
@Controller('user-badges')
export class UserBadgesController {
  constructor(private readonly userBadgesService: UserBadgesService) {}

  /**
   * List user badges.
   * Mirrors Express: GET /user-badges (supports optional user_id / badge_id filters).
   */
  @ApiOperation({ summary: 'List user badges' })
  @ApiOkResponse({ type: UserBadgeEntity, isArray: true })
  @Get()
  async list(@Query() query: UserBadgeQueryDto): Promise<UserBadgeEntity[]> {
    return this.userBadgesService.listUserBadges(query);
  }

  /**
   * Express-style alias: GET /user-badges/by-user/:user_id
   * (Read-only alias; same output as filtered list.)
   */
  @ApiOperation({ summary: 'List badges for a specific user' })
  @ApiOkResponse({ type: UserBadgeEntity, isArray: true })
  @Get('by-user/:user_id')
  async listByUser(@Param('user_id') userId: string) {
    return this.userBadgesService.listUserBadges({ user_id: Number(userId) });
  }

  /**
   * Get user badge by id.
   * Mirrors Express: GET /user-badges/:id.
   */
  @ApiOperation({ summary: 'Get user badge by id' })
  @ApiOkResponse({ type: UserBadgeEntity })
  @Get(':id')
  async get(@Param() params: UserBadgeIdParamDto): Promise<UserBadgeEntity> {
    const badge = await this.userBadgesService.getUserBadge(params.id);
    if (!badge) {
      throw new NotFoundException({ message: 'User badge not found' });
    }
    return badge;
  }

  /**
   * Create user badge (admin/system).
   * Mirrors Express: POST /user-badges.
   */
  @ApiOperation({ summary: 'Create user badge (admin)' })
  @ApiCreatedResponse({ type: UserBadgeEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() payload: CreateUserBadgeDto): Promise<UserBadgeEntity> {
    return this.userBadgesService.createUserBadge(payload);
  }

  /**
   * Update user badge (admin/system).
   * Mirrors Express: PUT /user-badges/:id.
   */
  @ApiOperation({ summary: 'Update user badge (admin)' })
  @ApiOkResponse({ type: UserBadgeEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param() params: UserBadgeIdParamDto,
    @Body() payload: UpdateUserBadgeDto,
  ): Promise<UserBadgeEntity> {
    const updated = await this.userBadgesService.updateUserBadge(params.id, payload);
    if (!updated) {
      throw new NotFoundException({ message: 'User badge not found' });
    }
    return updated;
  }

  /**
   * Delete user badge (admin/system).
   * Mirrors Express: DELETE /user-badges/:id.
   */
  @ApiOperation({ summary: 'Delete user badge (admin)' })
  @ApiNoContentResponse()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: UserBadgeIdParamDto): Promise<void> {
    const ok = await this.userBadgesService.deleteUserBadge(params.id);
    if (!ok) {
      throw new NotFoundException({ message: 'User badge not found' });
    }
  }
}
