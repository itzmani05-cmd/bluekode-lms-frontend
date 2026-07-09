import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FormStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { QueryStudentProfileDto } from './dto/query-student-profile.dto';

const STUDENT_PROFILE_SELECT = {
  student_profile_id: true,
  user_id: true,
  institution_id: true,
  department: true,
  academic_year: true,
  form_status: true,
  created_at: true,
  updated_at: true,
  user: {
    select: { user_id: true, full_name: true, last_name: true, email: true },
  },
  institution: {
    select: { institution_id: true, institution_name: true },
  },
} satisfies Prisma.StudentProfileSelect;

@Injectable()
export class StudentProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureInstitutionExists(institutionId: number) {
    const institution = await this.prisma.institution.findFirst({
      where: { institution_id: institutionId, is_deleted: false },
    });
    if (!institution) throw new NotFoundException('Institution not found');
  }

  async create(userId: number, dto: CreateStudentProfileDto, adminUserId: number) {
    const user = await this.prisma.user.findFirst({
      where: { user_id: userId, is_deleted: false },
      include: { userRoles: { select: { role: { select: { role_name: true } } } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const isStudent = user.userRoles.some((ur) => ur.role.role_name === 'Student');
    if (!isStudent) {
      throw new BadRequestException('User does not have the Student role');
    }

    await this.ensureInstitutionExists(dto.institutionId);

    try {
      const profile = await this.prisma.studentProfile.create({
        data: {
          user_id: userId,
          institution_id: dto.institutionId,
          department: dto.department,
          academic_year: dto.academicYear,
          form_status: (dto.formStatus as FormStatus) ?? FormStatus.PENDING,
          created_by: adminUserId,
        },
        select: STUDENT_PROFILE_SELECT,
      });
      return { success: true, data: profile };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This user already has a student profile');
      }
      throw e;
    }
  }

  async findAll(dto: QueryStudentProfileDto) {
    const { page = 1, limit = 20, search, institutionId, formStatus } = dto;

    const where: Prisma.StudentProfileWhereInput = {
      ...(institutionId && { institution_id: institutionId }),
      ...(formStatus && { form_status: formStatus as FormStatus }),
      ...(search && { department: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.studentProfile.findMany({
        where,
        select: STUDENT_PROFILE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.studentProfile.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const profile = await this.prisma.studentProfile.findFirst({
      where: { student_profile_id: id },
      select: STUDENT_PROFILE_SELECT,
    });

    if (!profile) throw new NotFoundException('Student profile not found');
    return { success: true, data: profile };
  }

  async findByUser(userId: number) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { user_id: userId },
      select: STUDENT_PROFILE_SELECT,
    });

    if (!profile) throw new NotFoundException('Student profile not found for this user');
    return { success: true, data: profile };
  }

  async update(id: number, dto: UpdateStudentProfileDto, adminUserId: number) {
    await this.findOne(id);

    if (dto.institutionId !== undefined) {
      await this.ensureInstitutionExists(dto.institutionId);
    }

    const data: Prisma.StudentProfileUncheckedUpdateInput = { updated_by: adminUserId };
    if (dto.institutionId !== undefined) data.institution_id = dto.institutionId;
    if (dto.department !== undefined) data.department = dto.department;
    if (dto.academicYear !== undefined) data.academic_year = dto.academicYear;
    if (dto.formStatus !== undefined) data.form_status = dto.formStatus as FormStatus;

    const profile = await this.prisma.studentProfile.update({
      where: { student_profile_id: id },
      data,
      select: STUDENT_PROFILE_SELECT,
    });

    return { success: true, data: profile };
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.studentProfile.delete({ where: { student_profile_id: id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete a student profile with existing course enrollments',
        );
      }
      throw e;
    }

    return { success: true, message: 'Student profile deleted successfully' };
  }
}
