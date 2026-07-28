import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introduction to React' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  moduleName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moduleDescription?: string;

  @ApiPropertyOptional({
    description: 'Display order (auto-assigned if omitted)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  moduleOrder?: number;
}
