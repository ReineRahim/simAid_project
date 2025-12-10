import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class SubmitScenarioDto {
  @ApiProperty({
    description: 'Array of selected answers in order (e.g., ["A","B"])',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  userAnswers: string[];
}
