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
import { EmployeeProfilesService } from './employee-profiles.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { QueryEmployeeProfileDto } from './dto/query-employee-profile.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Employee Profiles')
@ApiBearerAuth()
@Controller()
export class EmployeeProfilesController {
  constructor(
    private readonly employeeProfilesService: EmployeeProfilesService,
  ) {}

  @Post('users/:userId/employee-profile')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Create an employee profile for a staff user (Admin only)',
  })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({
    status: 201,
    description: 'Employee profile created successfully',
  })
  @ApiResponse({ status: 400, description: 'User does not have a staff role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'User already has an employee profile',
  })
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateEmployeeProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.employeeProfilesService.create(userId, dto, user.sub);
  }

  @Get('users/:userId/employee-profile')
  @ApiOperation({ summary: "Get a user's employee profile" })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Employee profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee profile not found for this user',
  })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.employeeProfilesService.findByUser(userId);
  }

  @Get('employee-profiles')
  @ApiOperation({
    summary: 'List all employee profiles with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of employee profiles',
  })
  findAll(@Query() dto: QueryEmployeeProfileDto) {
    return this.employeeProfilesService.findAll(dto);
  }

  @Get('employee-profiles/:id')
  @ApiOperation({ summary: 'Get an employee profile by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Employee profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee profile not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeProfilesService.findOne(id);
  }

  @Patch('employee-profiles/:id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update an employee profile (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Employee profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee profile not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.employeeProfilesService.update(id, dto, user.sub);
  }

  @Delete('employee-profiles/:id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete an employee profile (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Employee profile deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee profile not found' })
  @ApiResponse({
    status: 409,
    description: 'Employee profile has existing dependent records',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeProfilesService.remove(id);
  }
}
