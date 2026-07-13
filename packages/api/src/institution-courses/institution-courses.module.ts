import { Module } from '@nestjs/common';
import { InstitutionCoursesController } from './institution-courses.controller';
import { InstitutionCoursesService } from './institution-courses.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstitutionCoursesController],
  providers: [InstitutionCoursesService],
  exports: [InstitutionCoursesService],
})
export class InstitutionCoursesModule {}
