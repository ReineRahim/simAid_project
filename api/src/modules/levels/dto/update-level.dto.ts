import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateLevelDto {
  @ApiProperty({
    description: 'Updated title of the level.',
    example: 'Intermediate+',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({
    description: 'Updated description (optional).',
    example: 'More challenging content.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Updated ordering for the level.',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  difficulty_order: number;
}
