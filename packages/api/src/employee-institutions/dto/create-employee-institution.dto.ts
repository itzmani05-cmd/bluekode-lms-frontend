import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum EmployeeInstitutionStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateEmployeeInstitutionDto {
  @ApiProperty({ example: 1, description: 'employee_profile_id to assign to this institution' })
  @IsInt()
  @Min(1)
  employeeProfileId: number;

  @ApiPropertyOptional({ example: 2, description: 'employee_profile_id of the project lead' })
  @IsOptional()
  @IsInt()
  @Min(1)
  projectLeadEmployeeId?: number;

  @ApiPropertyOptional({ example: 3, description: 'employee_profile_id of the technical lead' })
  @IsOptional()
  @IsInt()
  @Min(1)
  technicalLeadEmployeeId?: number;

  @ApiPropertyOptional({ description: 'Defaults to now if omitted' })
  @IsOptional()
  @IsDateString()
  assignedDate?: string;

  @ApiPropertyOptional({
    enum: EmployeeInstitutionStatusDto,
    default: EmployeeInstitutionStatusDto.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmployeeInstitutionStatusDto)
  status?: EmployeeInstitutionStatusDto;
}
