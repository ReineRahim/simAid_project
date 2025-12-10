import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class LevelIdParamDto {
  @ApiProperty({
    description: 'Level identifier (positive integer).',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
