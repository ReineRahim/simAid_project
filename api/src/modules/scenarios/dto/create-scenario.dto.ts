import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateScenarioDto {
  @ApiProperty({ description: 'Associated level id', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  level_id: number;

  @ApiProperty({ description: 'Scenario title', example: 'Warehouse Fire' })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiProperty({
    description: 'Scenario description',
    example: 'Handle emergency evacuation safely',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Optional image URL',
    example: 'https://example.com/fire.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}
