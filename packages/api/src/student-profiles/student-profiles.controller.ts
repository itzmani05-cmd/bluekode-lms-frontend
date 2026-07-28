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
import { StudentProfilesService } from './student-profiles.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { QueryStudentProfileDto } from './dto/query-student-profile.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Student Profiles')
@ApiBearerAuth()
@Controller()
export class StudentProfilesController {
  constructor(
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @Post('users/:userId/student-profile')
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a student profile for a user (Admin only)' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({
    status: 201,
    description: 'Student profile created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not have the Student role',
  })
  @ApiResponse({ status: 404, description: 'User or institution not found' })
  @ApiResponse({
    status: 409,
    description: 'User already has a student profile',
  })
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateStudentProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studentProfilesService.create(userId, dto, user.sub);
  }

  @Get('users/:userId/student-profile')
  @ApiOperation({ summary: "Get a user's student profile" })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Student profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student profile not found for this user',
  })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.studentProfilesService.findByUser(userId);
  }

  @Get('student-profiles')
  @ApiOperation({
    summary: 'List all student profiles with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of student profiles',
  })
  findAll(@Query() dto: QueryStudentProfileDto) {
    return this.studentProfilesService.findAll(dto);
  }

  @Get('student-profiles/:id')
  @ApiOperation({ summary: 'Get a student profile by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Student profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentProfilesService.findOne(id);
  }

  @Patch('student-profiles/:id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update a student profile (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Student profile updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student profile or institution not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studentProfilesService.update(id, dto, user.sub);
  }

  @Delete('student-profiles/:id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete a student profile (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Student profile deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  @ApiResponse({
    status: 409,
    description: 'Student profile has existing course enrollments',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentProfilesService.remove(id);
  }
}
