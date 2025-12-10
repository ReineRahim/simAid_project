import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email address', example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'secret123' })
  @IsString()
  @Length(6, 255)
  password: string;
}
