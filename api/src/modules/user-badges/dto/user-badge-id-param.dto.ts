import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UserBadgeIdParamDto {
  @ApiProperty({ description: 'User badge identifier', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
