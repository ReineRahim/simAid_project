import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UserBadgeQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user id', example: 8 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @ApiPropertyOptional({ description: 'Filter by badge id', example: 3 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  badge_id?: number;
}
