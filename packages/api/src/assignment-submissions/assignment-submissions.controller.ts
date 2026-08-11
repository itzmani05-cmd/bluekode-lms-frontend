import {
  Body,
  Controller,
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
import { AssignmentSubmissionsService } from './assignment-submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

@ApiTags('Assignment Submissions')
@ApiBearerAuth()
@Controller()
export class AssignmentSubmissionsController {
  constructor(
    private readonly submissionsService: AssignmentSubmissionsService,
  ) {}

  @Get('submissions/recent')
  @ApiOperation({ summary: 'Get recent submissions across all enrollments (admin)' })
  @ApiResponse({ status: 200, description: 'Recent submissions' })
  findRecent(@Query('limit') limit?: string) {
    return this.submissionsService.findRecent(limit ? parseInt(limit, 10) : 10);
  }

  @Get('enrollments/:enrollmentId/submissions')
  @ApiOperation({
    summary: 'List the latest submission per assignment for an enrollment',
  })
  @ApiParam({ name: 'enrollmentId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Latest submissions for the enrollment',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findLatestForEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.submissionsService.findLatestForEnrollment(enrollmentId);
  }

  @Patch('submissions/:id/review')
  @ApiOperation({
    summary: 'Review a submission (trainer marks + feedback + status)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'submission_id (BigInt as string)',
  })
  @ApiResponse({ status: 200, description: 'Submission reviewed' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  reviewSubmission(@Param('id') id: string, @Body() dto: ReviewSubmissionDto) {
    return this.submissionsService.reviewSubmission(BigInt(id), dto);
  }

  @Post('enrollments/:enrollmentId/lectures/:lectureId/submissions')
  @ApiOperation({ summary: 'Submit an assignment attempt for an enrollment' })
  @ApiParam({ name: 'enrollmentId', type: Number })
  @ApiParam({ name: 'lectureId', type: Number })
  @ApiResponse({ status: 201, description: 'Submission created' })
  @ApiResponse({ status: 404, description: 'Enrollment or lecture not found' })
  @ApiResponse({
    status: 400,
    description:
      'Lecture is not an assignment or does not belong to this course',
  })
  create(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.submissionsService.create(enrollmentId, lectureId, dto);
  }
}
