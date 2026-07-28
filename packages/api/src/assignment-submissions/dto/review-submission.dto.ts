import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ReviewSubmissionDto {
  @IsEnum(['UNDER_REVIEW', 'REVIEWED', 'RESUBMISSION_REQUIRED'])
  submission_status: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  marks_obtained?: number;

  @IsOptional()
  @IsString()
  trainer_feedback?: string;
}
