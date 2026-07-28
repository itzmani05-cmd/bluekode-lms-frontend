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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { AllowedEmails } from '../auth/decorators/allowed-emails.decorator';
import { AllowedEmailsGuard } from '../auth/guards/allowed-emails.guard';

// Course create/update/delete is restricted to this single trainer account.
const COURSE_MANAGER_EMAIL = 'trainer@company.com';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(AllowedEmailsGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Create a course' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List courses with pagination and filters' })
  findAll(@Query() dto: QueryCourseDto) {
    return this.coursesService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Soft-delete a course' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
