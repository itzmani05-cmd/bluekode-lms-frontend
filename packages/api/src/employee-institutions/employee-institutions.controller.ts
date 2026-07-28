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
import { EmployeeInstitutionsService } from './employee-institutions.service';
import { CreateEmployeeInstitutionDto } from './dto/create-employee-institution.dto';
import { UpdateEmployeeInstitutionDto } from './dto/update-employee-institution.dto';
import { QueryEmployeeInstitutionDto } from './dto/query-employee-institution.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Employee Institutions')
@ApiBearerAuth()
@Controller()
export class EmployeeInstitutionsController {
  constructor(
    private readonly employeeInstitutionsService: EmployeeInstitutionsService,
  ) {}

  @Post('institutions/:institutionId/employees')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Assign an employee profile to an institution (Admin only)',
  })
  @ApiParam({ name: 'institutionId', type: Number })
  @ApiResponse({ status: 201, description: 'Assignment created successfully' })
  @ApiResponse({
    status: 404,
    description: 'Institution or employee profile not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Employee already assigned to this institution',
  })
  create(
    @Param('institutionId', ParseIntPipe) institutionId: number,
    @Body() dto: CreateEmployeeInstitutionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.employeeInstitutionsService.create(
      institutionId,
      dto,
      user.sub,
    );
  }

  @Get('institutions/:institutionId/employees')
  @ApiOperation({ summary: 'List employees assigned to an institution' })
  @ApiParam({ name: 'institutionId', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of assignments' })
  @ApiResponse({ status: 404, description: 'Institution not found' })
  findAllForInstitution(
    @Param('institutionId', ParseIntPipe) institutionId: number,
    @Query() dto: QueryEmployeeInstitutionDto,
  ) {
    return this.employeeInstitutionsService.findAllForInstitution(
      institutionId,
      dto,
    );
  }

  @Get('employee-profiles/:employeeProfileId/institutions')
  @ApiOperation({ summary: 'List institutions an employee is assigned to' })
  @ApiParam({ name: 'employeeProfileId', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of assignments' })
  @ApiResponse({ status: 404, description: 'Employee profile not found' })
  findAllForEmployee(
    @Param('employeeProfileId', ParseIntPipe) employeeProfileId: number,
    @Query() dto: QueryEmployeeInstitutionDto,
  ) {
    return this.employeeInstitutionsService.findAllForEmployee(
      employeeProfileId,
      dto,
    );
  }

  @Get('employee-institutions/:id')
  @ApiOperation({ summary: 'Get an employee institution assignment by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Assignment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeInstitutionsService.findOne(id);
  }

  @Patch('employee-institutions/:id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Update an employee institution assignment (Admin only)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Assignment updated successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeInstitutionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.employeeInstitutionsService.update(id, dto, user.sub);
  }

  @Delete('employee-institutions/:id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Remove an employee institution assignment (Admin only)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Assignment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeInstitutionsService.remove(id);
  }
}
