import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateScenarioStepDto {
  @ApiProperty({ description: 'Scenario id', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  scenario_id: number;

  @ApiProperty({ description: 'Step order within scenario', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  step_order: number;

  @ApiProperty({ description: 'Question text', example: 'What should you do next?' })
  @IsString()
  @Length(5)
  question_text: string;

  @ApiProperty({ description: 'Option A', example: 'Call for help' })
  @IsString()
  option_a: string;

  @ApiProperty({ description: 'Option B', example: 'Assess the situation' })
  @IsString()
  option_b: string;

  @ApiProperty({ description: 'Option C', example: 'Move forward' })
  @IsString()
  option_c: string;

  @ApiProperty({ description: 'Option D', example: 'Stop immediately' })
  @IsString()
  option_d: string;

  @ApiProperty({ description: 'Correct action', example: 'B', enum: ['A', 'B', 'C', 'D'] })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  correct_action: string;

  @ApiProperty({
    description: 'Optional feedback message',
    example: 'Always assess before acting.',
    required: false,
  })
  @IsOptional()
  @IsString()
  feedback_message?: string;
}
