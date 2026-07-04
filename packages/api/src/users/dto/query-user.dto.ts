import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryUserDto {
  @ApiPropertyOptional({
    example: 'Manikandan',
    description: 'Search by name or email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Role ID',
  })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Institution ID',
  })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'User status',
  })
  @IsOptional()
  @IsString()
  status?: string;
}