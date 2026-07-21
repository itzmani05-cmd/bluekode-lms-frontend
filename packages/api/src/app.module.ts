import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { CoursesModule } from './courses/courses.module';
import { InstitutionCoursesModule } from './institution-courses/institution-courses.module';
import { EmployeeProfilesModule } from './employee-profiles/employee-profiles.module';
import { EmployeeInstitutionsModule } from './employee-institutions/employee-institutions.module';
import { StudentProfilesModule } from './student-profiles/student-profiles.module';
import { StudentCourseEnrollmentsModule } from './student-course-enrollments/student-course-enrollments.module';
import { ModulesModule } from './modules/modules.module';
import { LecturesModule } from './lectures/lectures.module';
import { StudentProgressModule } from './student-progress/student-progress.module';
import { AssignmentSubmissionsModule } from './assignment-submissions/assignment-submissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    InstitutionsModule,
    CoursesModule,
    InstitutionCoursesModule,
    EmployeeProfilesModule,
    EmployeeInstitutionsModule,
    StudentProfilesModule,
    StudentCourseEnrollmentsModule,
    ModulesModule,
    LecturesModule,
    StudentProgressModule,
    AssignmentSubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
