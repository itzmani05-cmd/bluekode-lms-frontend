import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrainerAssignmentDto } from './dto/create-trainer-assignment.dto';

const ASSIGNMENT_SELECT = {
  trainer_assignment_id: true,
  assignment_type: true,
  created_at: true,
  trainer: {
    select: {
      employee_profile_id: true,
      user: { select: { full_name: true, last_name: true, email: true } },
    },
  },
  course: { select: { course_id: true, course_name: true } },
  studentProfile: {
    select: {
      student_profile_id: true,
      department: true,
      user: { select: { full_name: true, last_name: true, email: true } },
      institution: { select: { institution_id: true, institution_name: true } },
    },
  },
  institution: { select: { institution_id: true, institution_name: true } },
} satisfies Prisma.TrainerAssignmentSelect;

@Injectable()
export class TrainerAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureTrainerExists(employeeProfileId: number) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { employee_profile_id: employeeProfileId },
    });
    if (!profile)
      throw new NotFoundException('Trainer employee profile not found');
    return profile;
  }

  private async ensureCourseExists(courseId: number) {
    const course = await this.prisma.course.findFirst({
      where: { course_id: courseId, is_deleted: false },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(dto: CreateTrainerAssignmentDto) {
    await this.ensureTrainerExists(dto.trainerEmployeeProfileId);
    await this.ensureCourseExists(dto.courseId);

    if (dto.assignmentType === AssignmentType.STUDENT) {
      if (!dto.studentProfileId) {
        throw new BadRequestException(
          'studentProfileId is required for STUDENT assignment type',
        );
      }
      const student = await this.prisma.studentProfile.findUnique({
        where: { student_profile_id: dto.studentProfileId },
      });
      if (!student) throw new NotFoundException('Student profile not found');
    }

    if (dto.assignmentType === AssignmentType.INSTITUTION) {
      if (!dto.institutionId) {
        throw new BadRequestException(
          'institutionId is required for INSTITUTION assignment type',
        );
      }
      const inst = await this.prisma.institution.findFirst({
        where: { institution_id: dto.institutionId, is_deleted: false },
      });
      if (!inst) throw new NotFoundException('Institution not found');
    }

    try {
      const assignment = await this.prisma.trainerAssignment.create({
        data: {
          trainer_employee_profile_id: dto.trainerEmployeeProfileId,
          course_id: dto.courseId,
          assignment_type: dto.assignmentType,
          student_profile_id:
            dto.assignmentType === AssignmentType.STUDENT
              ? dto.studentProfileId
              : null,
          institution_id:
            dto.assignmentType === AssignmentType.INSTITUTION
              ? dto.institutionId
              : null,
        },
        select: ASSIGNMENT_SELECT,
      });
      return { success: true, data: assignment };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('This trainer assignment already exists');
      }
      throw e;
    }
  }

  async findAll(filters?: {
    trainerId?: number;
    courseId?: number;
    assignmentType?: AssignmentType;
  }) {
    const where: Prisma.TrainerAssignmentWhereInput = {
      ...(filters?.trainerId && {
        trainer_employee_profile_id: filters.trainerId,
      }),
      ...(filters?.courseId && { course_id: filters.courseId }),
      ...(filters?.assignmentType && {
        assignment_type: filters.assignmentType,
      }),
    };

    const data = await this.prisma.trainerAssignment.findMany({
      where,
      select: ASSIGNMENT_SELECT,
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data };
  }

  async findByTrainer(employeeProfileId: number) {
    await this.ensureTrainerExists(employeeProfileId);
    const data = await this.prisma.trainerAssignment.findMany({
      where: { trainer_employee_profile_id: employeeProfileId },
      select: ASSIGNMENT_SELECT,
      orderBy: { created_at: 'desc' },
    });
    return { success: true, data };
  }

  async getAccessibleStudents(employeeProfileId: number) {
    await this.ensureTrainerExists(employeeProfileId);

    const assignments = await this.prisma.trainerAssignment.findMany({
      where: { trainer_employee_profile_id: employeeProfileId },
      select: {
        trainer_assignment_id: true,
        assignment_type: true,
        course_id: true,
        student_profile_id: true,
        institution_id: true,
        course: { select: { course_id: true, course_name: true } },
      },
    });

    const results: {
      assignmentId: number;
      assignmentType: AssignmentType;
      course: { id: number; name: string };
      student: {
        profileId: number;
        fullName: string;
        email: string;
        institution: string;
        department: string | null;
        enrollment: {
          id: number;
          status: string;
          completionPercentage: string;
          assignedDate: Date | null;
          progresses: {
            lectureId: number;
            title: string;
            contentType: string;
            progressStatus: string;
          }[];
        } | null;
      };
    }[] = [];

    const seenKey = new Set<string>();

    for (const a of assignments) {
      if (
        a.assignment_type === AssignmentType.STUDENT &&
        a.student_profile_id
      ) {
        const key = `${a.student_profile_id}-${a.course_id}`;
        if (seenKey.has(key)) continue;
        seenKey.add(key);

        const sp = await this.prisma.studentProfile.findUnique({
          where: { student_profile_id: a.student_profile_id },
          select: {
            student_profile_id: true,
            department: true,
            user: { select: { full_name: true, last_name: true, email: true } },
            institution: { select: { institution_name: true } },
          },
        });
        if (!sp) continue;

        const enrollment = await this.prisma.studentCourseEnrollment.findFirst({
          where: {
            student_profile_id: a.student_profile_id,
            course_id: a.course_id,
          },
          select: {
            enrollment_id: true,
            enrollment_status: true,
            completion_percentage: true,
            assigned_date: true,
            progresses: {
              select: {
                lecture_id: true,
                progress_status: true,
                lecture: { select: { title: true, content_type: true } },
              },
            },
          },
        });

        results.push({
          assignmentId: a.trainer_assignment_id,
          assignmentType: AssignmentType.STUDENT,
          course: { id: a.course.course_id, name: a.course.course_name },
          student: {
            profileId: sp.student_profile_id,
            fullName: `${sp.user.full_name} ${sp.user.last_name}`.trim(),
            email: sp.user.email,
            institution: sp.institution.institution_name,
            department: sp.department,
            enrollment: enrollment
              ? {
                  id: enrollment.enrollment_id,
                  status: enrollment.enrollment_status,
                  completionPercentage:
                    enrollment.completion_percentage.toString(),
                  assignedDate: enrollment.assigned_date,
                  progresses: enrollment.progresses.map((p) => ({
                    lectureId: p.lecture_id,
                    title: p.lecture.title,
                    contentType: p.lecture.content_type,
                    progressStatus: p.progress_status,
                  })),
                }
              : null,
          },
        });
      }

      if (
        a.assignment_type === AssignmentType.INSTITUTION &&
        a.institution_id
      ) {
        const enrollments = await this.prisma.studentCourseEnrollment.findMany({
          where: {
            course_id: a.course_id,
            studentProfile: { institution_id: a.institution_id },
          },
          select: {
            enrollment_id: true,
            enrollment_status: true,
            completion_percentage: true,
            assigned_date: true,
            studentProfile: {
              select: {
                student_profile_id: true,
                department: true,
                user: {
                  select: { full_name: true, last_name: true, email: true },
                },
                institution: { select: { institution_name: true } },
              },
            },
            progresses: {
              select: {
                lecture_id: true,
                progress_status: true,
                lecture: { select: { title: true, content_type: true } },
              },
            },
          },
        });

        for (const enrollment of enrollments) {
          const key = `${enrollment.studentProfile.student_profile_id}-${a.course_id}`;
          if (seenKey.has(key)) continue;
          seenKey.add(key);

          results.push({
            assignmentId: a.trainer_assignment_id,
            assignmentType: AssignmentType.INSTITUTION,
            course: { id: a.course.course_id, name: a.course.course_name },
            student: {
              profileId: enrollment.studentProfile.student_profile_id,
              fullName:
                `${enrollment.studentProfile.user.full_name} ${enrollment.studentProfile.user.last_name}`.trim(),
              email: enrollment.studentProfile.user.email,
              institution:
                enrollment.studentProfile.institution.institution_name,
              department: enrollment.studentProfile.department,
              enrollment: {
                id: enrollment.enrollment_id,
                status: enrollment.enrollment_status,
                completionPercentage:
                  enrollment.completion_percentage.toString(),
                assignedDate: enrollment.assigned_date,
                progresses: enrollment.progresses.map((p) => ({
                  lectureId: p.lecture_id,
                  title: p.lecture.title,
                  contentType: p.lecture.content_type,
                  progressStatus: p.progress_status,
                })),
              },
            },
          });
        }
      }
    }

    return { success: true, data: results };
  }

  async getStudentSubmissions(employeeProfileId: number) {
    await this.ensureTrainerExists(employeeProfileId);

    const assignments = await this.prisma.trainerAssignment.findMany({
      where: { trainer_employee_profile_id: employeeProfileId },
      select: {
        assignment_type: true,
        course_id: true,
        student_profile_id: true,
        institution_id: true,
        course: { select: { course_name: true } },
      },
    });

    // Collect unique enrollment IDs + metadata
    const seenEnrollments = new Set<number>();
    const enrollmentMeta = new Map<
      number,
      { studentName: string; courseName: string }
    >();

    for (const a of assignments) {
      if (a.assignment_type === 'STUDENT' && a.student_profile_id) {
        const enr = await this.prisma.studentCourseEnrollment.findFirst({
          where: {
            student_profile_id: a.student_profile_id,
            course_id: a.course_id,
          },
          select: {
            enrollment_id: true,
            studentProfile: {
              select: {
                user: { select: { full_name: true, last_name: true } },
              },
            },
          },
        });
        if (enr && !seenEnrollments.has(enr.enrollment_id)) {
          seenEnrollments.add(enr.enrollment_id);
          enrollmentMeta.set(enr.enrollment_id, {
            studentName:
              `${enr.studentProfile.user.full_name} ${enr.studentProfile.user.last_name}`.trim(),
            courseName: a.course.course_name,
          });
        }
      }

      if (a.assignment_type === 'INSTITUTION' && a.institution_id) {
        const enrs = await this.prisma.studentCourseEnrollment.findMany({
          where: {
            course_id: a.course_id,
            studentProfile: { institution_id: a.institution_id },
          },
          select: {
            enrollment_id: true,
            studentProfile: {
              select: {
                user: { select: { full_name: true, last_name: true } },
              },
            },
          },
        });
        for (const enr of enrs) {
          if (!seenEnrollments.has(enr.enrollment_id)) {
            seenEnrollments.add(enr.enrollment_id);
            enrollmentMeta.set(enr.enrollment_id, {
              studentName:
                `${enr.studentProfile.user.full_name} ${enr.studentProfile.user.last_name}`.trim(),
              courseName: a.course.course_name,
            });
          }
        }
      }
    }

    const results: {
      submission_id: string;
      student_name: string;
      course_name: string;
      assignment_title: string;
      module_name: string;
      submission_status: string;
      attempt_no: number;
      submission_url: string | null;
      remarks: string | null;
      marks_obtained: number | null;
      max_marks: number | null;
      trainer_feedback: string | null;
      submitted_at: Date | null;
      reviewed_at: Date | null;
    }[] = [];

    for (const [enrollmentId, meta] of enrollmentMeta.entries()) {
      const subs = await this.prisma.assignmentSubmission.findMany({
        where: { enrollment_id: enrollmentId },
        orderBy: { created_at: 'desc' },
        select: {
          submission_id: true,
          attempt_no: true,
          submission_url: true,
          remarks: true,
          marks_obtained: true,
          trainer_feedback: true,
          submission_status: true,
          created_at: true,
          reviewed_at: true,
          lecture: {
            select: {
              title: true,
              max_marks: true,
              module: { select: { module_name: true } },
            },
          },
        },
      });

      for (const sub of subs) {
        results.push({
          submission_id: sub.submission_id.toString(),
          student_name: meta.studentName,
          course_name: meta.courseName,
          assignment_title: sub.lecture.title,
          module_name: sub.lecture.module.module_name,
          submission_status: sub.submission_status,
          attempt_no: sub.attempt_no,
          submission_url: sub.submission_url ?? null,
          remarks: sub.remarks ?? null,
          marks_obtained:
            sub.marks_obtained !== null ? Number(sub.marks_obtained) : null,
          max_marks:
            sub.lecture.max_marks !== null
              ? Number(sub.lecture.max_marks)
              : null,
          trainer_feedback: sub.trainer_feedback ?? null,
          submitted_at: sub.created_at,
          reviewed_at: sub.reviewed_at,
        });
      }
    }

    results.sort((a, b) => {
      if (!a.submitted_at) return 1;
      if (!b.submitted_at) return -1;
      return (
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      );
    });

    return { success: true, data: results };
  }

  async remove(id: number) {
    const existing = await this.prisma.trainerAssignment.findUnique({
      where: { trainer_assignment_id: id },
    });
    if (!existing) throw new NotFoundException('Trainer assignment not found');

    await this.prisma.trainerAssignment.delete({
      where: { trainer_assignment_id: id },
    });
    return {
      success: true,
      message: 'Trainer assignment removed successfully',
    };
  }
}
