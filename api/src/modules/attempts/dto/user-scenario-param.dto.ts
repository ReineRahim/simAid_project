import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UserScenarioParamDto {
  @ApiProperty({ description: 'User identifier', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  user_id: number;

  @ApiProperty({ description: 'Scenario identifier', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  scenario_id: number;
}
