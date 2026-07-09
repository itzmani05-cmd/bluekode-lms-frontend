import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentCourseEnrollmentsService } from './student-course-enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { QueryEnrollmentDto } from './dto/query-enrollment.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Student Course Enrollments')
@ApiBearerAuth()
@Controller()
export class StudentCourseEnrollmentsController {
  constructor(private readonly enrollmentsService: StudentCourseEnrollmentsService) {}

  @Post('student-profiles/:studentProfileId/enrollments')
  @Roles('Admin')
  @ApiOperation({ summary: 'Enroll a student profile in a course (Admin only)' })
  @ApiParam({ name: 'studentProfileId', type: Number })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 404, description: 'Student profile or course not found' })
  @ApiResponse({ status: 409, description: 'Already enrolled in this course' })
  create(
    @Param('studentProfileId', ParseIntPipe) studentProfileId: number,
    @Body() dto: CreateEnrollmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.enrollmentsService.create(studentProfileId, dto, user.sub);
  }

  @Get('student-profiles/:studentProfileId/enrollments')
  @ApiOperation({ summary: 'List enrollments for a student profile' })
  @ApiParam({ name: 'studentProfileId', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of enrollments' })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  findAllForProfile(
    @Param('studentProfileId', ParseIntPipe) studentProfileId: number,
    @Query() dto: QueryEnrollmentDto,
  ) {
    return this.enrollmentsService.findAllForProfile(studentProfileId, dto);
  }

  @Get('courses/:courseId/enrollments')
  @ApiOperation({ summary: 'List enrollments for a course' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of enrollments' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findAllForCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query() dto: QueryEnrollmentDto,
  ) {
    return this.enrollmentsService.findAllForCourse(courseId, dto);
  }

  @Get('enrollments/:id')
  @ApiOperation({ summary: 'Get an enrollment by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Enrollment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch('enrollments/:id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update an enrollment — status, progress, dates (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Enrollment updated successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEnrollmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.enrollmentsService.update(id, dto, user.sub);
  }

  @Delete('enrollments/:id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete an enrollment (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({ status: 409, description: 'Enrollment has existing progress or submissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
