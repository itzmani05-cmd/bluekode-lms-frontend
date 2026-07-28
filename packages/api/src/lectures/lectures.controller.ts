import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { AllowedEmails } from '../auth/decorators/allowed-emails.decorator';
import { AllowedEmailsGuard } from '../auth/guards/allowed-emails.guard';

// Lesson (lecture/task/assignment) create/update/delete is restricted to this single trainer account.
const COURSE_MANAGER_EMAIL = 'trainer@company.com';

@ApiTags('Lectures')
@Controller()
@UseGuards(AllowedEmailsGuard)
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('modules/:moduleId/lectures')
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Create a lecture in a module' })
  @ApiParam({ name: 'moduleId', type: Number })
  @ApiResponse({ status: 201 })
  create(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() dto: CreateLectureDto,
  ) {
    return this.lecturesService.create(moduleId, dto);
  }

  @Get('modules/:moduleId/lectures')
  @ApiOperation({ summary: 'List all lectures for a module' })
  @ApiParam({ name: 'moduleId', type: Number })
  findByModule(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.lecturesService.findByModule(moduleId);
  }

  @Get('lectures/:id')
  @ApiOperation({ summary: 'Get a lecture by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lecturesService.findOne(id);
  }

  @Patch('lectures/:id')
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Update a lecture' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLectureDto) {
    return this.lecturesService.update(id, dto);
  }

  @Delete('lectures/:id')
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Soft-delete a lecture' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lecturesService.remove(id);
  }
}
