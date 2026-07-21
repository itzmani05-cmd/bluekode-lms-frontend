import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentCourseEnrollmentsController } from './student-course-enrollments.controller';
import { StudentCourseEnrollmentsService } from './student-course-enrollments.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentCourseEnrollmentsController],
  providers: [StudentCourseEnrollmentsService],
  exports: [StudentCourseEnrollmentsService],
})
export class StudentCourseEnrollmentsModule {}
