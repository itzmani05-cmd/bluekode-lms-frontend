import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { QueryEnrollmentDto } from './dto/query-enrollment.dto';
import { BulkEnrollRowDto } from './dto/bulk-enroll.dto';

export interface BulkEnrollRowResult {
  email: string;
  status: 'created_and_enrolled' | 'enrolled' | 'already_enrolled' | 'error';
  message?: string;
  generatedPassword?: string;
}

const generateTempPassword = (): string => {
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$!';
  const pool = upper + lower + digits + special;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const rest = Array.from(
    { length: 6 },
    () => pool[Math.floor(Math.random() * pool.length)],
  );
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('');
};

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

@Injectable()
export class StudentCourseEnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureStudentProfileExists(studentProfileId: number) {
    const profile = await this.prisma.studentProfile.findFirst({
      where: { student_profile_id: studentProfileId },
    });
    if (!profile) throw new NotFoundException('Student profile not found');
  }

  private async ensureCourseExists(courseId: number) {
    const course = await this.prisma.course.findFirst({
      where: { course_id: courseId, is_deleted: false },
    });
    if (!course) throw new NotFoundException('Course not found');
  }

  async create(
    studentProfileId: number,
    dto: CreateEnrollmentDto,
    adminUserId: number,
  ) {
    await this.ensureStudentProfileExists(studentProfileId);
    await this.ensureCourseExists(dto.courseId);

    try {
      const enrollment = await this.prisma.studentCourseEnrollment.create({
        data: {
          student_profile_id: studentProfileId,
          course_id: dto.courseId,
          enrollment_status:
            (dto.enrollmentStatus as EnrollmentStatus) ??
            EnrollmentStatus.ASSIGNED,
          assigned_date: dto.assignedDate
            ? new Date(dto.assignedDate)
            : new Date(),
          created_by: adminUserId,
        },
        select: ENROLLMENT_SELECT,
      });
      return { success: true, data: enrollment };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'This student profile is already enrolled in this course',
        );
      }
      throw e;
    }
  }

  async bulkEnroll(
    courseId: number,
    rows: BulkEnrollRowDto[],
    adminUserId: number,
  ) {
    await this.ensureCourseExists(courseId);

    const institutionIds = [...new Set(rows.map((r) => r.institutionId))];
    const validInstitutions = await this.prisma.institution.findMany({
      where: { institution_id: { in: institutionIds }, is_deleted: false },
      select: { institution_id: true },
    });
    const validInstitutionIds = new Set(
      validInstitutions.map((i) => i.institution_id),
    );

    const studentRole = await this.prisma.role.findFirst({
      where: { role_name: { equals: 'student', mode: 'insensitive' } },
    });

    const results: BulkEnrollRowResult[] = [];

    for (const row of rows) {
      try {
        if (!validInstitutionIds.has(row.institutionId)) {
          results.push({
            email: row.email,
            status: 'error',
            message: `Institution ${row.institutionId} not found`,
          });
          continue;
        }

        let user = await this.prisma.user.findFirst({
          where: {
            email: { equals: row.email, mode: 'insensitive' },
            is_deleted: false,
          },
        });

        let generatedPassword: string | undefined;
        let createdAccount = false;

        if (!user) {
          if (!studentRole) {
            results.push({
              email: row.email,
              status: 'error',
              message: "No 'Student' role configured in the system",
            });
            continue;
          }
          generatedPassword = generateTempPassword();
          const password_hash = await bcrypt.hash(generatedPassword, 10);
          user = await this.prisma.user.create({
            data: {
              full_name: row.fullName,
              last_name: row.lastName ?? '-',
              email: row.email,
              password_hash,
              account_status: 'ACTIVE',
            },
          });
          await this.prisma.userRole.create({
            data: { user_id: user.user_id, role_id: studentRole.role_id },
          });
          createdAccount = true;
        }

        let profile = await this.prisma.studentProfile.findUnique({
          where: { user_id: user.user_id },
        });

        if (!profile) {
          profile = await this.prisma.studentProfile.create({
            data: {
              user_id: user.user_id,
              institution_id: row.institutionId,
              department: row.department,
              academic_year: row.academicYear,
              form_status: 'VERIFIED',
              created_by: adminUserId,
            },
          });
        }

        try {
          await this.prisma.studentCourseEnrollment.create({
            data: {
              student_profile_id: profile.student_profile_id,
              course_id: courseId,
              enrollment_status: EnrollmentStatus.ASSIGNED,
              assigned_date: new Date(),
              created_by: adminUserId,
            },
          });
          results.push({
            email: row.email,
            status: createdAccount ? 'created_and_enrolled' : 'enrolled',
            generatedPassword,
          });
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2002'
          ) {
            results.push({
              email: row.email,
              status: 'already_enrolled',
              generatedPassword,
            });
          } else {
            throw e;
          }
        }
      } catch (e) {
        results.push({
          email: row.email,
          status: 'error',
          message: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }

    return {
      success: true,
      data: results,
      summary: {
        total: results.length,
        createdAccounts: results.filter(
          (r) => r.status === 'created_and_enrolled',
        ).length,
        enrolled: results.filter(
          (r) => r.status === 'created_and_enrolled' || r.status === 'enrolled',
        ).length,
        alreadyEnrolled: results.filter((r) => r.status === 'already_enrolled')
          .length,
        errors: results.filter((r) => r.status === 'error').length,
      },
    };
  }

  async findAllForProfile(studentProfileId: number, dto: QueryEnrollmentDto) {
    await this.ensureStudentProfileExists(studentProfileId);
    return this.paginate({ student_profile_id: studentProfileId }, dto);
  }

  async findAllForCourse(courseId: number, dto: QueryEnrollmentDto) {
    await this.ensureCourseExists(courseId);
    return this.paginate({ course_id: courseId }, dto);
  }

  private async paginate(
    baseWhere: Prisma.StudentCourseEnrollmentWhereInput,
    dto: QueryEnrollmentDto,
  ) {
    const { page = 1, limit = 20, enrollmentStatus } = dto;

    const where: Prisma.StudentCourseEnrollmentWhereInput = {
      ...baseWhere,
      ...(enrollmentStatus && {
        enrollment_status: enrollmentStatus,
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.studentCourseEnrollment.findMany({
        where,
        select: ENROLLMENT_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.studentCourseEnrollment.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const enrollment = await this.prisma.studentCourseEnrollment.findFirst({
      where: { enrollment_id: id },
      select: ENROLLMENT_SELECT,
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return { success: true, data: enrollment };
  }

  async update(id: number, dto: UpdateEnrollmentDto, adminUserId: number) {
    await this.findOne(id);

    const data: Prisma.StudentCourseEnrollmentUncheckedUpdateInput = {
      updated_by: adminUserId,
    };
    if (dto.enrollmentStatus !== undefined) {
      data.enrollment_status = dto.enrollmentStatus;
    }
    if (dto.completionPercentage !== undefined)
      data.completion_percentage = dto.completionPercentage;
    if (dto.assignedDate !== undefined)
      data.assigned_date = new Date(dto.assignedDate);
    if (dto.completedDate !== undefined)
      data.completed_date = new Date(dto.completedDate);

    const enrollment = await this.prisma.studentCourseEnrollment.update({
      where: { enrollment_id: id },
      data,
      select: ENROLLMENT_SELECT,
    });

    return { success: true, data: enrollment };
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.studentCourseEnrollment.delete({
        where: { enrollment_id: id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ConflictException(
          'Cannot delete an enrollment with existing progress or assignment submissions',
        );
      }
      throw e;
    }

    return { success: true, message: 'Enrollment deleted successfully' };
  }
}
