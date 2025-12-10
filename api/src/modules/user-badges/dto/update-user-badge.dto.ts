import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateUserBadgeDto {
  @ApiProperty({ description: 'User id', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  user_id: number;

  @ApiProperty({ description: 'Badge id', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  badge_id: number;

  @ApiProperty({ description: 'Optional earned_at timestamp', required: false })
  @IsOptional()
  earned_at?: string | Date;
}
