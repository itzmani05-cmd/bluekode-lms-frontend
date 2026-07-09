import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { InstitutionCoursesService } from './institution-courses.service';
import { CreateInstitutionCourseDto } from './dto/create-institution-course.dto';
import { QueryInstitutionCourseDto } from './dto/query-institution-course.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Institution Courses')
@ApiBearerAuth()
@Controller()
export class InstitutionCoursesController {
  constructor(private readonly institutionCoursesService: InstitutionCoursesService) {}

  @Post('institutions/:institutionId/courses')
  @Roles('Admin')
  @ApiOperation({ summary: 'Assign a course to an institution (Admin only)' })
  @ApiParam({ name: 'institutionId', type: Number })
  @ApiResponse({ status: 201, description: 'Assignment created successfully' })
  @ApiResponse({ status: 404, description: 'Institution or course not found' })
  @ApiResponse({ status: 409, description: 'Course already assigned to this institution' })
  create(
    @Param('institutionId', ParseIntPipe) institutionId: number,
    @Body() dto: CreateInstitutionCourseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.institutionCoursesService.create(institutionId, dto, user.sub);
  }

  @Get('institutions/:institutionId/courses')
  @ApiOperation({ summary: 'List courses assigned to an institution' })
  @ApiParam({ name: 'institutionId', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of assignments' })
  @ApiResponse({ status: 404, description: 'Institution not found' })
  findAllForInstitution(
    @Param('institutionId', ParseIntPipe) institutionId: number,
    @Query() dto: QueryInstitutionCourseDto,
  ) {
    return this.institutionCoursesService.findAllForInstitution(institutionId, dto);
  }

  @Get('courses/:courseId/institutions')
  @ApiOperation({ summary: 'List institutions a course is assigned to' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of assignments' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findAllForCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query() dto: QueryInstitutionCourseDto,
  ) {
    return this.institutionCoursesService.findAllForCourse(courseId, dto);
  }

  @Get('institution-courses/:id')
  @ApiOperation({ summary: 'Get an institution course assignment by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Assignment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.institutionCoursesService.findOne(id);
  }

  @Delete('institution-courses/:id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Remove a course assignment from an institution (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Assignment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.institutionCoursesService.remove(id);
  }
}
