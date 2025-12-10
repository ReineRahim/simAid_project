import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UserLevelUpsertDto {
  @ApiProperty({ description: 'User id', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  user_id: number;

  @ApiProperty({ description: 'Level id', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  level_id: number;

  @ApiProperty({ description: 'Unlocked flag', example: true, default: false, required: false })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  unlocked?: boolean;

  @ApiProperty({ description: 'Completed flag', example: false, default: false, required: false })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
