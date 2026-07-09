import { Module } from '@nestjs/common';
import { EmployeeInstitutionsController } from './employee-institutions.controller';
import { EmployeeInstitutionsService } from './employee-institutions.service';

@Module({
  controllers: [EmployeeInstitutionsController],
  providers: [EmployeeInstitutionsService],
  exports: [EmployeeInstitutionsService],
})
export class EmployeeInstitutionsModule {}
