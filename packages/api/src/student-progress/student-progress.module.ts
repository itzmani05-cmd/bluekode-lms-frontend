import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentProgressController } from './student-progress.controller';
import { StudentProgressService } from './student-progress.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentProgressController],
  providers: [StudentProgressService],
  exports: [StudentProgressService],
})
export class StudentProgressModule {}
