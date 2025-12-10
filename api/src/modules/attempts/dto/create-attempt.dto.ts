import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class CreateAttemptDto {
  @ApiProperty({ description: 'Scenario identifier', example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  scenario_id: number;

  @ApiProperty({ description: 'Score between 0 and 100', example: 85 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;
}
