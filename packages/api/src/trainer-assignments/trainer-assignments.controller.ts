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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';
import { TrainerAssignmentsService } from './trainer-assignments.service';
import { CreateTrainerAssignmentDto } from './dto/create-trainer-assignment.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Trainer Assignments')
@ApiBearerAuth()
@Controller('trainer-assignments')
export class TrainerAssignmentsController {
  constructor(private readonly service: TrainerAssignmentsService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a trainer assignment (Admin only)' })
  @ApiResponse({ status: 201, description: 'Assignment created' })
  @ApiResponse({ status: 409, description: 'Assignment already exists' })
  create(@Body() dto: CreateTrainerAssignmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'List all trainer assignments (Admin only)' })
  @ApiQuery({ name: 'trainerId', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiQuery({ name: 'assignmentType', required: false, enum: AssignmentType })
  findAll(
    @Query('trainerId') trainerId?: string,
    @Query('courseId') courseId?: string,
    @Query('assignmentType') assignmentType?: AssignmentType,
  ) {
    return this.service.findAll({
      trainerId: trainerId ? Number(trainerId) : undefined,
      courseId: courseId ? Number(courseId) : undefined,
      assignmentType,
    });
  }

  @Get('trainer/:employeeProfileId')
  @ApiOperation({ summary: "Get a trainer's own assignments" })
  @ApiParam({ name: 'employeeProfileId', type: Number })
  findByTrainer(@Param('employeeProfileId', ParseIntPipe) employeeProfileId: number) {
    return this.service.findByTrainer(employeeProfileId);
  }

  @Get('trainer/:employeeProfileId/students')
  @ApiOperation({ summary: "Get all students accessible to a trainer" })
  @ApiParam({ name: 'employeeProfileId', type: Number })
  getAccessibleStudents(@Param('employeeProfileId', ParseIntPipe) employeeProfileId: number) {
    return this.service.getAccessibleStudents(employeeProfileId);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Remove a trainer assignment (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Assignment removed' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
