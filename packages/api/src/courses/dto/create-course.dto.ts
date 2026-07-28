import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum CourseStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Advanced Data Security & Compliance' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Encryption, auditing, and regulatory frameworks.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: CourseStatusEnum,
    default: CourseStatusEnum.DRAFT,
  })
  @IsOptional()
  @IsEnum(CourseStatusEnum)
  status?: CourseStatusEnum;
}
