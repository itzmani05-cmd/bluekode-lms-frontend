import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { QueryInstitutionDto } from './dto/query-institution.dto';

const INSTITUTION_SELECT = {
  institution_id:   true,
  institution_name: true,
  address:          true,
  city:             true,
  is_deleted:       true,
  created_at:       true,
  _count: {
    select: {
      institutionCourses:   true,
      employeeInstitutions: true,
      studentProfiles:      true,
    },
  },
} satisfies Prisma.InstitutionSelect;

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInstitutionDto) {
    try {
      const institution = await this.prisma.institution.create({
        data: {
          institution_name: dto.institutionName,
          address: dto.address,
          city:    dto.city,
        },
        select: INSTITUTION_SELECT,
      });
      return { success: true, data: institution };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('An institution with this name already exists');
      }
      throw e;
    }
  }

  async findAll(dto: QueryInstitutionDto) {
    const { page = 1, limit = 20, search } = dto;
    const where: Prisma.InstitutionWhereInput = {
      is_deleted: false,
      ...(search && {
        OR: [
          { institution_name: { contains: search, mode: 'insensitive' } },
          { city:             { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.institution.findMany({
        where,
        select: INSTITUTION_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.institution.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const institution = await this.prisma.institution.findFirst({
      where: { institution_id: id, is_deleted: false },
      select: INSTITUTION_SELECT,
    });
    if (!institution) throw new NotFoundException('Institution not found');
    return { success: true, data: institution };
  }

  async update(id: number, dto: UpdateInstitutionDto) {
    await this.findOne(id);
    const institution = await this.prisma.institution.update({
      where: { institution_id: id },
      data: {
        ...(dto.institutionName && { institution_name: dto.institutionName }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city    !== undefined && { city:    dto.city    }),
      },
      select: INSTITUTION_SELECT,
    });
    return { success: true, data: institution };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.institution.update({
      where: { institution_id: id },
      data: { is_deleted: true, deleted_at: new Date() },
    });
    return { success: true, message: 'Institution deleted successfully' };
  }
}
