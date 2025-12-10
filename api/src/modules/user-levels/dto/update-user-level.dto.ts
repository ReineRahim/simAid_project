import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserLevelDto {
  @ApiProperty({ description: 'Whether level is unlocked', example: true, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unlocked?: boolean;

  @ApiProperty({ description: 'Whether level is completed', example: false, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  completed?: boolean;
}
