import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Full name', example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  full_name?: string;

  @ApiProperty({ description: 'Email', example: 'jane@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Password', example: 'secret123', required: false })
  @IsOptional()
  @IsString()
  @Length(6, 255)
  password?: string;

  @ApiProperty({ description: 'Role', example: 'admin', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
