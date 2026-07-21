import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentProgressService } from './student-progress.service';

@ApiTags('Student Progress')
@ApiBearerAuth()
@Controller()
export class StudentProgressController {
  constructor(private readonly progressService: StudentProgressService) {}

  @Get('enrollments/:enrollmentId/progress')
  @ApiOperation({ summary: 'List lecture progress for an enrollment' })
  @ApiParam({ name: 'enrollmentId', type: Number })
  @ApiResponse({ status: 200, description: 'Progress rows for the enrollment' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findAllForEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.progressService.findAllForEnrollment(enrollmentId);
  }

  @Post('enrollments/:enrollmentId/lectures/:lectureId/complete')
  @ApiOperation({
    summary: 'Mark a lecture as viewed/completed for an enrollment',
  })
  @ApiParam({ name: 'enrollmentId', type: Number })
  @ApiParam({ name: 'lectureId', type: Number })
  @ApiResponse({
    status: 201,
    description: 'Lecture marked as completed; enrollment progress updated',
  })
  @ApiResponse({ status: 404, description: 'Enrollment or lecture not found' })
  @ApiResponse({
    status: 400,
    description: "Lecture does not belong to this enrollment's course",
  })
  markComplete(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('lectureId', ParseIntPipe) lectureId: number,
  ) {
    return this.progressService.markComplete(enrollmentId, lectureId);
  }
}
