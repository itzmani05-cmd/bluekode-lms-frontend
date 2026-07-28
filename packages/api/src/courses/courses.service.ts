import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';

const COURSE_SELECT = {
  course_id: true,
  course_name: true,
  description: true,
  status: true,
  is_deleted: true,
  created_at: true,
  updated_at: true,
  _count: { select: { modules: true, enrollments: true } },
} satisfies Prisma.CourseSelect;

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    const course = await this.prisma.course.create({
      data: {
        course_name: dto.name,
        description: dto.description,
        status: dto.status ?? 'DRAFT',
      },
      select: COURSE_SELECT,
    });
    return { success: true, data: course };
  }

  async findAll(dto: QueryCourseDto) {
    const { page = 1, limit = 20, search, status } = dto;
    const where: Prisma.CourseWhereInput = {
      is_deleted: false,
      ...(status && { status: status }),
      ...(search && { course_name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        select: COURSE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findFirst({
      where: { course_id: id, is_deleted: false },
      select: COURSE_SELECT,
    });
    if (!course) throw new NotFoundException('Course not found');
    return { success: true, data: course };
  }

  async update(id: number, dto: UpdateCourseDto) {
    await this.findOne(id);
    const course = await this.prisma.course.update({
      where: { course_id: id },
      data: {
        ...(dto.name && { course_name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
      },
      select: COURSE_SELECT,
    });
    return { success: true, data: course };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.course.update({
      where: { course_id: id },
      data: { is_deleted: true, deleted_at: new Date() },
    });
    return { success: true, message: 'Course deleted successfully' };
  }
}
