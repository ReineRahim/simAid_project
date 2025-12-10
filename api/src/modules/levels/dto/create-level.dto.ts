import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({
    description: 'Title or name of the level.',
    example: 'Beginner',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({
    description: 'Optional description for the level.',
    example: 'Introductory level for new users.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Order in which the level should appear (positive integer).',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  difficulty_order: number;
}
