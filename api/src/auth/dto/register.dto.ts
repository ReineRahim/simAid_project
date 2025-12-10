import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Full name of the user', example: 'Jane Doe' })
  @IsString()
  @Length(1, 255)
  full_name: string;

  @ApiProperty({ description: 'Email address', example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'secret123' })
  @IsString()
  @Length(6, 255)
  password: string;

  @ApiProperty({ description: 'Optional role', example: 'admin', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
