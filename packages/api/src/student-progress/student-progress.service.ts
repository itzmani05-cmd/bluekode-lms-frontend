import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus, LessonProgressStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const ENROLLMENT_SELECT = {
  enrollment_id: true,
  student_profile_id: true,
  course_id: true,
  enrollment_status: true,
  completion_percentage: true,
  assigned_date: true,
  completed_date: true,
  created_at: true,
  updated_at: true,
  course: { select: { course_id: true, course_name: true } },
  studentProfile: {
    select: {
      student_profile_id: true,
      user: {
        select: {
          user_id: true,
          full_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.StudentCourseEnrollmentSelect;

const PROGRESS_SELECT = {
  progress_id: true,
  enrollment_id: true,
  lecture_id: true,
  progress_status: true,
  started_at: true,
  completion_date: true,
  last_accessed: true,
} satisfies Prisma.StudentProgressSelect;

type RawProgress = Prisma.StudentProgressGetPayload<{ select: typeof PROGRESS_SELECT }>;

const mapProgress = (p: RawProgress) => ({ ...p, progress_id: p.progress_id.toString() });

@Injectable()
export class StudentProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureEnrollmentExists(enrollmentId: number) {
    const enrollment = await this.prisma.studentCourseEnrollment.findFirst({
      where: { enrollment_id: enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async findAllForEnrollment(enrollmentId: number) {
    await this.ensureEnrollmentExists(enrollmentId);
    const rows = await this.prisma.studentProgress.findMany({
      where: { enrollment_id: enrollmentId },
      select: PROGRESS_SELECT,
    });
    return { success: true, data: rows.map(mapProgress) };
  }

  async markComplete(enrollmentId: number, lectureId: number) {
    const enrollment = await this.ensureEnrollmentExists(enrollmentId);

    const lecture = await this.prisma.lecture.findFirst({
      where: { lecture_id: lectureId, is_deleted: false },
      include: { module: true },
    });
    if (!lecture) throw new NotFoundException('Lecture not found');
    if (lecture.module.course_id !== enrollment.course_id) {
      throw new BadRequestException(
        "Lecture does not belong to this enrollment's course",
      );
    }

    const now = new Date();
    const rawProgress = await this.prisma.studentProgress.upsert({
      where: {
        enrollment_id_lecture_id: {
          enrollment_id: enrollmentId,
          lecture_id: lectureId,
        },
      },
      create: {
        enrollment_id: enrollmentId,
        lecture_id: lectureId,
        progress_status: LessonProgressStatus.COMPLETED,
        started_at: now,
        completion_date: now,
        last_accessed: now,
      },
      update: {
        progress_status: LessonProgressStatus.COMPLETED,
        completion_date: now,
        last_accessed: now,
      },
      select: PROGRESS_SELECT,
    });

    const totalLectures = await this.prisma.lecture.count({
      where: {
        is_deleted: false,
        module: { course_id: enrollment.course_id, is_deleted: false },
      },
    });
    const completedCount = await this.prisma.studentProgress.count({
      where: {
        enrollment_id: enrollmentId,
        progress_status: LessonProgressStatus.COMPLETED,
      },
    });
    const pct =
      totalLectures > 0
        ? Math.round((completedCount / totalLectures) * 10000) / 100
        : 0;

    const updateData: Prisma.StudentCourseEnrollmentUncheckedUpdateInput = {
      completion_percentage: pct,
    };
    if (pct >= 100) {
      updateData.enrollment_status = EnrollmentStatus.COMPLETED;
      updateData.completed_date = now;
    }

    const updatedEnrollment = await this.prisma.studentCourseEnrollment.update({
      where: { enrollment_id: enrollmentId },
      data: updateData,
      select: ENROLLMENT_SELECT,
    });

    return {
      success: true,
      data: { progress: mapProgress(rawProgress), enrollment: updatedEnrollment },
    };
  }
}
