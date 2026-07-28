import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeInstitutionStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeInstitutionDto } from './dto/create-employee-institution.dto';
import { UpdateEmployeeInstitutionDto } from './dto/update-employee-institution.dto';
import { QueryEmployeeInstitutionDto } from './dto/query-employee-institution.dto';

const EMPLOYEE_INSTITUTION_SELECT = {
  employee_institution_id: true,
  employee_profile_id: true,
  institution_id: true,
  project_lead_employee_id: true,
  technical_lead_employee_id: true,
  assigned_date: true,
  status: true,
  created_at: true,
  updated_at: true,
  employeeProfile: {
    select: {
      employee_profile_id: true,
      user: { select: { user_id: true, full_name: true, last_name: true } },
    },
  },
  institution: { select: { institution_id: true, institution_name: true } },
} satisfies Prisma.EmployeeInstitutionSelect;

@Injectable()
export class EmployeeInstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureInstitutionExists(institutionId: number) {
    const institution = await this.prisma.institution.findFirst({
      where: { institution_id: institutionId, is_deleted: false },
    });
    if (!institution) throw new NotFoundException('Institution not found');
  }

  private async ensureEmployeeProfileExists(employeeProfileId: number) {
    const profile = await this.prisma.employeeProfile.findFirst({
      where: { employee_profile_id: employeeProfileId },
    });
    if (!profile) throw new NotFoundException('Employee profile not found');
  }

  async create(
    institutionId: number,
    dto: CreateEmployeeInstitutionDto,
    adminUserId: number,
  ) {
    await this.ensureInstitutionExists(institutionId);
    await this.ensureEmployeeProfileExists(dto.employeeProfileId);
    if (dto.projectLeadEmployeeId !== undefined) {
      await this.ensureEmployeeProfileExists(dto.projectLeadEmployeeId);
    }
    if (dto.technicalLeadEmployeeId !== undefined) {
      await this.ensureEmployeeProfileExists(dto.technicalLeadEmployeeId);
    }

    try {
      const assignment = await this.prisma.employeeInstitution.create({
        data: {
          institution_id: institutionId,
          employee_profile_id: dto.employeeProfileId,
          project_lead_employee_id: dto.projectLeadEmployeeId,
          technical_lead_employee_id: dto.technicalLeadEmployeeId,
          assigned_date: dto.assignedDate
            ? new Date(dto.assignedDate)
            : new Date(),
          status:
            (dto.status as EmployeeInstitutionStatus) ??
            EmployeeInstitutionStatus.ACTIVE,
          created_by: adminUserId,
        },
        select: EMPLOYEE_INSTITUTION_SELECT,
      });
      return { success: true, data: assignment };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'This employee is already assigned to this institution',
        );
      }
      throw e;
    }
  }

  async findAllForInstitution(
    institutionId: number,
    dto: QueryEmployeeInstitutionDto,
  ) {
    await this.ensureInstitutionExists(institutionId);
    return this.paginate({ institution_id: institutionId }, dto);
  }

  async findAllForEmployee(
    employeeProfileId: number,
    dto: QueryEmployeeInstitutionDto,
  ) {
    await this.ensureEmployeeProfileExists(employeeProfileId);
    return this.paginate({ employee_profile_id: employeeProfileId }, dto);
  }

  private async paginate(
    baseWhere: Prisma.EmployeeInstitutionWhereInput,
    dto: QueryEmployeeInstitutionDto,
  ) {
    const { page = 1, limit = 20, status } = dto;

    const where: Prisma.EmployeeInstitutionWhereInput = {
      ...baseWhere,
      ...(status && { status: status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employeeInstitution.findMany({
        where,
        select: EMPLOYEE_INSTITUTION_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.employeeInstitution.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const assignment = await this.prisma.employeeInstitution.findFirst({
      where: { employee_institution_id: id },
      select: EMPLOYEE_INSTITUTION_SELECT,
    });

    if (!assignment)
      throw new NotFoundException('Employee institution assignment not found');
    return { success: true, data: assignment };
  }

  async update(
    id: number,
    dto: UpdateEmployeeInstitutionDto,
    adminUserId: number,
  ) {
    await this.findOne(id);

    if (dto.projectLeadEmployeeId !== undefined) {
      await this.ensureEmployeeProfileExists(dto.projectLeadEmployeeId);
    }
    if (dto.technicalLeadEmployeeId !== undefined) {
      await this.ensureEmployeeProfileExists(dto.technicalLeadEmployeeId);
    }

    const data: Prisma.EmployeeInstitutionUncheckedUpdateInput = {
      updated_by: adminUserId,
    };
    if (dto.projectLeadEmployeeId !== undefined) {
      data.project_lead_employee_id = dto.projectLeadEmployeeId;
    }
    if (dto.technicalLeadEmployeeId !== undefined) {
      data.technical_lead_employee_id = dto.technicalLeadEmployeeId;
    }
    if (dto.assignedDate !== undefined)
      data.assigned_date = new Date(dto.assignedDate);
    if (dto.status !== undefined) data.status = dto.status;

    const assignment = await this.prisma.employeeInstitution.update({
      where: { employee_institution_id: id },
      data,
      select: EMPLOYEE_INSTITUTION_SELECT,
    });

    return { success: true, data: assignment };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.employeeInstitution.delete({
      where: { employee_institution_id: id },
    });

    return {
      success: true,
      message: 'Employee institution assignment deleted successfully',
    };
  }
}
