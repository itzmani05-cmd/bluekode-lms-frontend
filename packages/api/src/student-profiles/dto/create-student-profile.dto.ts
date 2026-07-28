import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum FormStatusDto {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
}

export class CreateStudentProfileDto {
  @ApiProperty({
    example: 1,
    description: 'institution_id the student belongs to',
  })
  @IsInt()
  @Min(1)
  institutionId: number;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    example: 2026,
    description: 'Academic year, e.g. 2026',
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(3000)
  academicYear?: number;

  @ApiPropertyOptional({ enum: FormStatusDto, default: FormStatusDto.PENDING })
  @IsOptional()
  @IsEnum(FormStatusDto)
  formStatus?: FormStatusDto;
}
