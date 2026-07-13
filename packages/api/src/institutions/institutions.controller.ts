import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { QueryInstitutionDto } from './dto/query-institution.dto';

@ApiTags('Institutions')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an institution' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateInstitutionDto) {
    return this.institutionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List institutions' })
  findAll(@Query() dto: QueryInstitutionDto) {
    return this.institutionsService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an institution by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.institutionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an institution' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInstitutionDto) {
    return this.institutionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an institution' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.institutionsService.remove(id);
  }
}
