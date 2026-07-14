import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { QueryEmployeeProfileDto } from './dto/query-employee-profile.dto';

const STAFF_ROLES = ['Trainer', 'Technical Head', 'Project Head'];

const EMPLOYEE_PROFILE_SELECT = {
  employee_profile_id: true,
  user_id: true,
  designation: true,
  specialization: true,
  years_of_experience: true,
  joining_date: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  user: {
    select: {
      user_id: true,
      full_name: true,
      last_name: true,
      email: true,
      userRoles: { select: { role: { select: { role_name: true } } } },
    },
  },
  employeeInstitutions: {
    where: { status: 'ACTIVE' },
    select: { institution: { select: { institution_id: true, institution_name: true } } },
  },
} satisfies Prisma.EmployeeProfileSelect;

@Injectable()
export class EmployeeProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateEmployeeProfileDto, adminUserId: number) {
    const user = await this.prisma.user.findFirst({
      where: { user_id: userId, is_deleted: false },
      include: { userRoles: { select: { role: { select: { role_name: true } } } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const isStaff = user.userRoles.some((ur) => STAFF_ROLES.includes(ur.role.role_name));
    if (!isStaff) {
      throw new BadRequestException(
        `User does not have a staff role (${STAFF_ROLES.join(', ')})`,
      );
    }

    try {
      const profile = await this.prisma.employeeProfile.create({
        data: {
          user_id: userId,
          designation: dto.designation,
          specialization: dto.specialization,
          years_of_experience: dto.yearsOfExperience,
          joining_date: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
          is_active: dto.isActive ?? true,
          created_by: adminUserId,
        },
        select: EMPLOYEE_PROFILE_SELECT,
      });
      return { success: true, data: profile };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This user already has an employee profile');
      }
      throw e;
    }
  }

  async findAll(dto: QueryEmployeeProfileDto) {
    const { page = 1, limit = 20, search, isActive } = dto;

    const where: Prisma.EmployeeProfileWhereInput = {
      ...(isActive !== undefined && { is_active: isActive }),
      ...(search && {
        OR: [
          { designation: { contains: search, mode: 'insensitive' } },
          { specialization: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employeeProfile.findMany({
        where,
        select: EMPLOYEE_PROFILE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.employeeProfile.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const profile = await this.prisma.employeeProfile.findFirst({
      where: { employee_profile_id: id },
      select: EMPLOYEE_PROFILE_SELECT,
    });

    if (!profile) throw new NotFoundException('Employee profile not found');
    return { success: true, data: profile };
  }

  async findByUser(userId: number) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { user_id: userId },
      select: EMPLOYEE_PROFILE_SELECT,
    });

    if (!profile) throw new NotFoundException('Employee profile not found for this user');
    return { success: true, data: profile };
  }

  async update(id: number, dto: UpdateEmployeeProfileDto, adminUserId: number) {
    await this.findOne(id);

    const data: Prisma.EmployeeProfileUncheckedUpdateInput = { updated_by: adminUserId };
    if (dto.designation !== undefined) data.designation = dto.designation;
    if (dto.specialization !== undefined) data.specialization = dto.specialization;
    if (dto.yearsOfExperience !== undefined) data.years_of_experience = dto.yearsOfExperience;
    if (dto.joiningDate !== undefined) data.joining_date = new Date(dto.joiningDate);
    if (dto.isActive !== undefined) data.is_active = dto.isActive;

    const profile = await this.prisma.employeeProfile.update({
      where: { employee_profile_id: id },
      data,
      select: EMPLOYEE_PROFILE_SELECT,
    });

    return { success: true, data: profile };
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.employeeProfile.delete({ where: { employee_profile_id: id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete an employee profile with existing institution assignments, reviewed submissions, or trainer substitutions',
        );
      }
      throw e;
    }

    return { success: true, message: 'Employee profile deleted successfully' };
  }
}
