import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ScenarioIdParamDto {
  @ApiProperty({ description: 'Scenario identifier', example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
