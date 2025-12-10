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
import { BadgeEntity } from '../../domain/entities/badge.entity';
import { BadgeIdParamDto } from './dto/badge-id-param.dto';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { BadgesService } from './badges.service';

@ApiTags('Badges')
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  /**
   * List badges (public).
   * Mirrors Express: GET /badges.
   */
  @ApiOperation({ summary: 'List badges' })
  @ApiOkResponse({ type: BadgeEntity, isArray: true })
  @Get()
  async list(): Promise<BadgeEntity[]> {
    return this.badgesService.listBadges();
  }

  /**
   * Get badge by id (public).
   * Mirrors Express: GET /badges/:id.
   */
  @ApiOperation({ summary: 'Get badge by id' })
  @ApiOkResponse({ type: BadgeEntity })
  @Get(':id')
  async get(@Param() params: BadgeIdParamDto): Promise<BadgeEntity> {
    const badge = await this.badgesService.getBadge(params.id);
    if (!badge) {
      throw new NotFoundException({ message: 'Badge not found' });
    }
    return badge;
  }

  /**
   * Create badge (admin).
   * Mirrors Express: POST /badges.
   */
  @ApiOperation({ summary: 'Create badge (admin)' })
  @ApiCreatedResponse({ type: BadgeEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() payload: CreateBadgeDto): Promise<BadgeEntity> {
    return this.badgesService.createBadge(payload);
  }

  /**
   * Update badge (admin).
   * Mirrors Express: PUT /badges/:id.
   */
  @ApiOperation({ summary: 'Update badge (admin)' })
  @ApiOkResponse({ type: BadgeEntity })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param() params: BadgeIdParamDto,
    @Body() payload: UpdateBadgeDto,
  ): Promise<BadgeEntity> {
    const updated = await this.badgesService.updateBadge(params.id, payload);
    if (!updated) {
      throw new NotFoundException({ message: 'Badge not found' });
    }
    return updated;
  }

  /**
   * Delete badge (admin).
   * Mirrors Express: DELETE /badges/:id.
   */
  @ApiOperation({ summary: 'Delete badge (admin)' })
  @ApiNoContentResponse()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: BadgeIdParamDto): Promise<void> {
    const ok = await this.badgesService.deleteBadge(params.id);
    if (!ok) {
      throw new NotFoundException({ message: 'Badge not found' });
    }
  }
}
