import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, ValidateIf } from 'class-validator';

export class CreateTrainerAssignmentDto {
  @ApiProperty({ description: 'EmployeeProfile ID of the trainer' })
  @IsInt()
  trainerEmployeeProfileId: number;

  @ApiProperty({ description: 'Course ID to assign the trainer to' })
  @IsInt()
  courseId: number;

  @ApiProperty({ enum: AssignmentType, description: 'STUDENT or INSTITUTION' })
  @IsEnum(AssignmentType)
  assignmentType: AssignmentType;

  @ApiPropertyOptional({ description: 'Required when assignmentType is STUDENT' })
  @ValidateIf((o) => o.assignmentType === AssignmentType.STUDENT)
  @IsInt()
  studentProfileId?: number;

  @ApiPropertyOptional({ description: 'Required when assignmentType is INSTITUTION' })
  @ValidateIf((o) => o.assignmentType === AssignmentType.INSTITUTION)
  @IsInt()
  institutionId?: number;
}
