import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  submissionUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
