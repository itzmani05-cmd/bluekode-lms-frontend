import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AssignmentSubmissionsController } from './assignment-submissions.controller';
import { AssignmentSubmissionsService } from './assignment-submissions.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [AssignmentSubmissionsController],
  providers: [AssignmentSubmissionsService],
  exports: [AssignmentSubmissionsService],
})
export class AssignmentSubmissionsModule {}
