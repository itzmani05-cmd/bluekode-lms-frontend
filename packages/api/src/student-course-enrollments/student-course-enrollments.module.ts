import { Module } from '@nestjs/common';
import { StudentCourseEnrollmentsController } from './student-course-enrollments.controller';
import { StudentCourseEnrollmentsService } from './student-course-enrollments.service';

@Module({
  controllers: [StudentCourseEnrollmentsController],
  providers: [StudentCourseEnrollmentsService],
  exports: [StudentCourseEnrollmentsService],
})
export class StudentCourseEnrollmentsModule {}
