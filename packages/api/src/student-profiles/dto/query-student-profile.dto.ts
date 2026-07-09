import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FormStatusDto } from './create-student-profile.dto';

export class QueryStudentProfileDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by department' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by institution_id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  institutionId?: number;

  @ApiPropertyOptional({ enum: FormStatusDto })
  @IsOptional()
  @IsEnum(FormStatusDto)
  formStatus?: FormStatusDto;
}
