import { Module } from '@nestjs/common';
import { EmployeeProfilesController } from './employee-profiles.controller';
import { EmployeeProfilesService } from './employee-profiles.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeProfilesController],
  providers: [EmployeeProfilesService],
  exports: [EmployeeProfilesService],
})
export class EmployeeProfilesModule {}
