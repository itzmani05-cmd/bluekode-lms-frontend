import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmployeeInstitutionsController } from './employee-institutions.controller';
import { EmployeeInstitutionsService } from './employee-institutions.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeInstitutionsController],
  providers: [EmployeeInstitutionsService],
  exports: [EmployeeInstitutionsService],
})
export class EmployeeInstitutionsModule {}
