import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UserLevelIdParamDto {
  @ApiProperty({ description: 'User level identifier', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
