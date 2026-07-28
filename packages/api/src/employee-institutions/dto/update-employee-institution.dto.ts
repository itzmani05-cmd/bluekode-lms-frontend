import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeInstitutionDto } from './create-employee-institution.dto';

export class UpdateEmployeeInstitutionDto extends PartialType(
  CreateEmployeeInstitutionDto,
) {}
