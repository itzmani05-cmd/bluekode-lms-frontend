import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssignmentSubmissionsService } from './assignment-submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@ApiTags('Assignment Submissions')
@ApiBearerAuth()
@Controller()
export class AssignmentSubmissionsController {
  constructor(private readonly submissionsService: AssignmentSubmissionsService) {}

  @Get('enrollments/:enrollmentId/submissions')
  @ApiOperation({ summary: 'List the latest submission per assignment for an enrollment' })
  @ApiParam({ name: 'enrollmentId', type: Number })
  @ApiResponse({ status: 200, description: 'Latest submissions for the enrollment' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findLatestForEnrollment(@Param('enrollmentId', ParseIntPipe) enrollmentId: number) {
    return this.submissionsService.findLatestForEnrollment(enrollmentId);
  }

  @Post('enrollments/:enrollmentId/lectures/:lectureId/submissions')
  @ApiOperation({ summary: 'Submit an assignment attempt for an enrollment' })
  @ApiParam({ name: 'enrollmentId', type: Number })
  @ApiParam({ name: 'lectureId', type: Number })
  @ApiResponse({ status: 201, description: 'Submission created' })
  @ApiResponse({ status: 404, description: 'Enrollment or lecture not found' })
  @ApiResponse({ status: 400, description: 'Lecture is not an assignment or does not belong to this course' })
  create(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.submissionsService.create(enrollmentId, lectureId, dto);
  }
}
