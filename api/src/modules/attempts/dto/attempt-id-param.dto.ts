import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AttemptIdParamDto {
  @ApiProperty({ description: 'Attempt identifier', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
