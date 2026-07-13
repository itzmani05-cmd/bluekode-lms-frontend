import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@bluekode.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin12345' })
  @IsString()
  @MinLength(4)
  password: string;
}
