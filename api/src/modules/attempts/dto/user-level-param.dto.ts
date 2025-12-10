import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UserLevelParamDto {
  @ApiProperty({ description: 'User identifier', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  user_id: number;

  @ApiProperty({ description: 'Level identifier', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  level_id: number;
}
