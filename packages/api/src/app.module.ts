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
import { ModulesModule } from './modules/modules.module';
import { LecturesModule } from './lectures/lectures.module';

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
    ModulesModule,
    LecturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
