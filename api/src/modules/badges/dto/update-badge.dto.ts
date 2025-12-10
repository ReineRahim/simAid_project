import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateBadgeDto {
  @ApiProperty({ description: 'Level id associated with badge', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  level_id: number;

  @ApiProperty({ description: 'Badge name', example: 'Explorer' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Badge description', example: 'Completed level 2' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Optional icon URL', required: false })
  @IsOptional()
  @IsString()
  icon_url?: string;
}
