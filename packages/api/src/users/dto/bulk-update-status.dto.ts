import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt } from 'class-validator';

export class BulkUpdateStatusDto {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ enum: AccountStatus })
  @IsEnum(AccountStatus)
  status: AccountStatus;
}
