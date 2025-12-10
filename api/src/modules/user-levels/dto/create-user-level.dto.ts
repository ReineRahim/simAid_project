import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateUserLevelDto {
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

  @ApiProperty({ description: 'Whether level is unlocked', example: true, default: false, required: false })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  unlocked?: boolean;

  @ApiProperty({ description: 'Whether level is completed', example: false, default: false, required: false })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
