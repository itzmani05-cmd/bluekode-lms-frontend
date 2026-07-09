import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {IsEmail,IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID, Matches , MaxLength,MinLength,} from 'class-validator';

export enum UserStatus {
    ACTIVE='ACTIVE', INACTIVE ='INACTIVE',
}

export class CreateUserDto {

  //first name
  @ApiProperty({
    example: 'Manikandan',
    description: 'First name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  full_name: string;

  //last name
  @ApiProperty({
    example: 'M',
    description: 'Last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  last_name: string;

  //email
  @ApiProperty({
    example: 'mani@example.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  //password
  @ApiProperty({
    example: 'Password@123',
    description: 'User password',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
    {
      message:'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;

  //phone number
  @ApiPropertyOptional({
    example: '+9198765*****',
    description: 'Phone number',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  //role id
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Role ID',
  })
  @IsUUID()
  roleId: string;

  //institution ID
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Institution ID',
  })
  @IsUUID()
  institutionId: string;

  //status
  @ApiPropertyOptional({
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}