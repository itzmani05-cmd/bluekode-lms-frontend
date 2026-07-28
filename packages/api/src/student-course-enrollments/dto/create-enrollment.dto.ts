import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum EnrollmentStatusDto {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateEnrollmentDto {
  @ApiProperty({
    example: 1,
    description: 'course_id to enroll the student profile in',
  })
  @IsInt()
  @Min(1)
  courseId: number;

  @ApiPropertyOptional({
    enum: EnrollmentStatusDto,
    default: EnrollmentStatusDto.ASSIGNED,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatusDto)
  enrollmentStatus?: EnrollmentStatusDto;

  @ApiPropertyOptional({ description: 'Defaults to now if omitted' })
  @IsOptional()
  @IsDateString()
  assignedDate?: string;
}
