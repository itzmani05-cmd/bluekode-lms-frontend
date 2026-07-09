import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { CreateEnrollmentDto } from './create-enrollment.dto';

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {
  @ApiPropertyOptional({ example: 45.5, description: 'Completion percentage, 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  completedDate?: string;
}
