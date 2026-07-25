import { Module } from '@nestjs/common';
import { TrainerAssignmentsController } from './trainer-assignments.controller';
import { TrainerAssignmentsService } from './trainer-assignments.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrainerAssignmentsController],
  providers: [TrainerAssignmentsService],
  exports: [TrainerAssignmentsService],
})
export class TrainerAssignmentsModule {}
