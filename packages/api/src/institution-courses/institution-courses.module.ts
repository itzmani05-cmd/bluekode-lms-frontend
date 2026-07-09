import { Module } from '@nestjs/common';
import { InstitutionCoursesController } from './institution-courses.controller';
import { InstitutionCoursesService } from './institution-courses.service';

@Module({
  controllers: [InstitutionCoursesController],
  providers: [InstitutionCoursesService],
  exports: [InstitutionCoursesService],
})
export class InstitutionCoursesModule {}
