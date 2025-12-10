import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AttemptIdParamDto {
  @ApiProperty({ description: 'Parent attempt id', example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  attempt_id: number;
}
