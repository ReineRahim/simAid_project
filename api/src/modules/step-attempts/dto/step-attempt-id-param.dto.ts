import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class StepAttemptIdParamDto {
  @ApiProperty({ description: 'Step attempt id', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
