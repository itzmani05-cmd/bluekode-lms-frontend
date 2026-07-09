import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateInstitutionCourseDto {
  @ApiProperty({ example: 1, description: 'course_id to make available at this institution' })
  @IsInt()
  @Min(1)
  courseId: number;
}
