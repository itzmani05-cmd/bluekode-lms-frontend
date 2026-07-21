import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

const SUBMISSION_SELECT = {
  submission_id: true,
  previous_submission_id: true,
  lecture_id: true,
  enrollment_id: true,
  attempt_no: true,
  submission_url: true,
  remarks: true,
  marks_obtained: true,
  trainer_feedback: true,
  submission_status: true,
  reviewed_at: true,
  created_at: true,
} satisfies Prisma.AssignmentSubmissionSelect;

type RawSubmission = Prisma.AssignmentSubmissionGetPayload<{ select: typeof SUBMISSION_SELECT }>;

// submission_id / previous_submission_id are Prisma BigInts, which JSON.stringify cannot serialize on its own
const mapSubmission = (s: RawSubmission) => ({
  ...s,
  submission_id: s.submission_id.toString(),
  previous_submission_id: s.previous_submission_id?.toString() ?? null,
  marks_obtained: s.marks_obtained ? Number(s.marks_obtained) : null,
});

@Injectable()
export class AssignmentSubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureEnrollmentExists(enrollmentId: number) {
    const enrollment = await this.prisma.studentCourseEnrollment.findFirst({
      where: { enrollment_id: enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async findLatestForEnrollment(enrollmentId: number) {
    await this.ensureEnrollmentExists(enrollmentId);

    const rows = await this.prisma.assignmentSubmission.findMany({
      where: { enrollment_id: enrollmentId },
      select: SUBMISSION_SELECT,
      orderBy: { attempt_no: 'desc' },
    });

    const latestByLecture = new Map<number, RawSubmission>();
    for (const row of rows) {
      if (!latestByLecture.has(row.lecture_id)) latestByLecture.set(row.lecture_id, row);
    }

    return { success: true, data: Array.from(latestByLecture.values()).map(mapSubmission) };
  }

  async create(enrollmentId: number, lectureId: number, dto: CreateSubmissionDto) {
    const enrollment = await this.ensureEnrollmentExists(enrollmentId);

    const lecture = await this.prisma.lecture.findFirst({
      where: { lecture_id: lectureId, is_deleted: false },
      include: { module: true },
    });
    if (!lecture) throw new NotFoundException('Lecture not found');
    if (lecture.content_type !== 'ASSIGNMENT') {
      throw new BadRequestException('This lecture is not an assignment');
    }
    if (lecture.module.course_id !== enrollment.course_id) {
      throw new BadRequestException("Lecture does not belong to this enrollment's course");
    }

    const previous = await this.prisma.assignmentSubmission.findFirst({
      where: { enrollment_id: enrollmentId, lecture_id: lectureId },
      orderBy: { attempt_no: 'desc' },
    });

    const created = await this.prisma.assignmentSubmission.create({
      data: {
        enrollment_id: enrollmentId,
        lecture_id: lectureId,
        attempt_no: (previous?.attempt_no ?? 0) + 1,
        previous_submission_id: previous?.submission_id,
        submission_url: dto.submissionUrl,
        remarks: dto.remarks,
        submission_status: SubmissionStatus.SUBMITTED,
      },
      select: SUBMISSION_SELECT,
    });

    return { success: true, data: mapSubmission(created) };
  }
}
