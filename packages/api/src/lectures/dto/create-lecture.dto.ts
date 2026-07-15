import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum ContentTypeEnum {
  LECTURE    = 'LECTURE',
  ASSIGNMENT = 'ASSIGNMENT',
}

export enum LessonStatusEnum {
  DRAFT     = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED  = 'ARCHIVED',
}

export class CreateLectureDto {
  @ApiProperty({ enum: ContentTypeEnum })
  @IsEnum(ContentTypeEnum)
  contentType: ContentTypeEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  displayOrder?: number;

  @ApiPropertyOptional({ enum: LessonStatusEnum, default: 'DRAFT' })
  @IsOptional()
  @IsEnum(LessonStatusEnum)
  lectureStatus?: LessonStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxMarks?: number;
}
