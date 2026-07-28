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
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AllowedEmails } from '../auth/decorators/allowed-emails.decorator';
import { AllowedEmailsGuard } from '../auth/guards/allowed-emails.guard';

// Module create/update/delete is restricted to this single trainer account.
const COURSE_MANAGER_EMAIL = 'trainer@company.com';

@ApiTags('Modules')
@Controller()
@UseGuards(AllowedEmailsGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post('courses/:courseId/modules')
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Create a module in a course' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiResponse({ status: 201 })
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateModuleDto,
  ) {
    return this.modulesService.create(courseId, dto);
  }

  @Get('courses/:courseId/modules')
  @ApiOperation({ summary: 'List all modules for a course' })
  @ApiParam({ name: 'courseId', type: Number })
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.modulesService.findByCourse(courseId);
  }

  @Get('modules/:id')
  @ApiOperation({ summary: 'Get a module by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.findOne(id);
  }

  @Patch('modules/:id')
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Update a module' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuleDto) {
    return this.modulesService.update(id, dto);
  }

  @Delete('modules/:id')
  @AllowedEmails(COURSE_MANAGER_EMAIL)
  @ApiOperation({ summary: 'Soft-delete a module' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.remove(id);
  }
}
