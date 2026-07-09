import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { QueryEnrollmentDto } from './dto/query-enrollment.dto';

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
      user: { select: { user_id: true, full_name: true, last_name: true, email: true } },
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

  async create(studentProfileId: number, dto: CreateEnrollmentDto, adminUserId: number) {
    await this.ensureStudentProfileExists(studentProfileId);
    await this.ensureCourseExists(dto.courseId);

    try {
      const enrollment = await this.prisma.studentCourseEnrollment.create({
        data: {
          student_profile_id: studentProfileId,
          course_id: dto.courseId,
          enrollment_status: (dto.enrollmentStatus as EnrollmentStatus) ?? EnrollmentStatus.ASSIGNED,
          assigned_date: dto.assignedDate ? new Date(dto.assignedDate) : new Date(),
          created_by: adminUserId,
        },
        select: ENROLLMENT_SELECT,
      });
      return { success: true, data: enrollment };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This student profile is already enrolled in this course');
      }
      throw e;
    }
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
      ...(enrollmentStatus && { enrollment_status: enrollmentStatus as EnrollmentStatus }),
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
      data.enrollment_status = dto.enrollmentStatus as EnrollmentStatus;
    }
    if (dto.completionPercentage !== undefined) data.completion_percentage = dto.completionPercentage;
    if (dto.assignedDate !== undefined) data.assigned_date = new Date(dto.assignedDate);
    if (dto.completedDate !== undefined) data.completed_date = new Date(dto.completedDate);

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
      await this.prisma.studentCourseEnrollment.delete({ where: { enrollment_id: id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete an enrollment with existing progress or assignment submissions',
        );
      }
      throw e;
    }

    return { success: true, message: 'Enrollment deleted successfully' };
  }
}
