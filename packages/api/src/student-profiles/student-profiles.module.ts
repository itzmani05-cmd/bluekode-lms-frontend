import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesService } from './student-profiles.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentProfilesController],
  providers: [StudentProfilesService],
  exports: [StudentProfilesService],
})
export class StudentProfilesModule {}
