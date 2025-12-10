import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsIn, IsString, Length, Min } from 'class-validator';

export class CreateStepAttemptDto {
  @ApiProperty({ description: 'Attempt id', example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  attempt_id: number;

  @ApiProperty({ description: 'Step id', example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  step_id: number;

  @ApiProperty({ description: 'User selected action', example: 'A', enum: ['A','B','C','D'] })
  @IsString()
  @Length(1, 1)
  @IsIn(['A', 'B', 'C', 'D'])
  user_action: string;

  @ApiProperty({ description: 'Whether action was correct', example: true })
  @Type(() => Boolean)
  @IsBoolean()
  is_correct: boolean;
}
