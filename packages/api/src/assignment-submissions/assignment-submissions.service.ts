import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

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
      include: { module: { include: { course: true } } },
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

    // Notify assigned trainers asynchronously — don't block the response
    this.notifyTrainers(enrollment.student_profile_id, enrollment.course_id, lecture).catch(() => {});

    return { success: true, data: mapSubmission(created) };
  }

  async reviewSubmission(submissionId: bigint, dto: ReviewSubmissionDto) {
    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { submission_id: submissionId },
    });
    if (!existing) throw new NotFoundException('Submission not found');

    const isResolved = dto.submission_status === 'REVIEWED' || dto.submission_status === 'RESUBMISSION_REQUIRED';

    const updated = await this.prisma.assignmentSubmission.update({
      where: { submission_id: submissionId },
      data: {
        submission_status: dto.submission_status as SubmissionStatus,
        marks_obtained:    dto.marks_obtained ?? null,
        trainer_feedback:  dto.trainer_feedback ?? null,
        reviewed_at:       isResolved ? new Date() : null,
      },
      select: SUBMISSION_SELECT,
    });

    // Notify the student asynchronously when the review is meaningful
    if (isResolved) {
      this.notifyStudent(updated.enrollment_id, updated.lecture_id, dto.submission_status, dto.marks_obtained).catch(() => {});
    }

    return { success: true, data: mapSubmission(updated) };
  }

  private async notifyStudent(
    enrollmentId: number,
    lectureId:    number,
    status:       string,
    marksObtained?: number,
  ) {
    const enrollment = await this.prisma.studentCourseEnrollment.findFirst({
      where:  { enrollment_id: enrollmentId },
      select: { studentProfile: { select: { user_id: true } } },
    });
    if (!enrollment) return;

    const lecture = await this.prisma.lecture.findFirst({
      where:  { lecture_id: lectureId, is_deleted: false },
      select: { title: true },
    });
    if (!lecture) return;

    const studentUserId = enrollment.studentProfile.user_id;
    const assignmentTitle = lecture.title;

    let title:   string;
    let message: string;

    if (status === 'REVIEWED') {
      title   = 'Assignment Reviewed';
      message = marksObtained !== undefined && marksObtained !== null
        ? `Your submission for "${assignmentTitle}" has been reviewed. You scored ${marksObtained} marks.`
        : `Your submission for "${assignmentTitle}" has been reviewed by your trainer.`;
    } else {
      title   = 'Resubmission Required';
      message = `Your submission for "${assignmentTitle}" needs to be revised. Please check the feedback and resubmit.`;
    }

    await this.notifications.createForUser(studentUserId, title, message);
  }

  private async notifyTrainers(
    studentProfileId: number,
    courseId: number,
    lecture: { title: string; module: { course: { course_name: string } } },
  ) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { student_profile_id: studentProfileId },
      select: {
        institution_id: true,
        user: { select: { full_name: true, last_name: true } },
      },
    });
    if (!studentProfile) return;

    const studentName = [studentProfile.user.full_name, studentProfile.user.last_name]
      .filter(Boolean)
      .join(' ');
    const assignmentTitle = lecture.title;
    const courseName = lecture.module.course.course_name;

    // Find trainers assigned directly to this student OR to their institution for this course
    const assignments = await this.prisma.trainerAssignment.findMany({
      where: {
        course_id: courseId,
        OR: [
          { assignment_type: 'STUDENT', student_profile_id: studentProfileId },
          { assignment_type: 'INSTITUTION', institution_id: studentProfile.institution_id },
        ],
      },
      select: {
        trainer: { select: { user_id: true } },
      },
    });

    const trainerUserIds = [...new Set(assignments.map((a) => a.trainer.user_id))];

    await Promise.all(
      trainerUserIds.map((userId) =>
        this.notifications.createForUser(
          userId,
          'New Assignment Submission',
          `${studentName} submitted "${assignmentTitle}" in ${courseName}.`,
        ),
      ),
    );
  }
}
