import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInstitutionCourseDto } from './dto/create-institution-course.dto';
import { QueryInstitutionCourseDto } from './dto/query-institution-course.dto';

const INSTITUTION_COURSE_SELECT = {
  institution_course_id: true,
  institution_id: true,
  course_id: true,
  created_at: true,
  updated_at: true,
  institution: { select: { institution_id: true, institution_name: true } },
  course: { select: { course_id: true, course_name: true, status: true } },
} satisfies Prisma.InstitutionCourseSelect;

@Injectable()
export class InstitutionCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureInstitutionExists(institutionId: number) {
    const institution = await this.prisma.institution.findFirst({
      where: { institution_id: institutionId, is_deleted: false },
    });
    if (!institution) throw new NotFoundException('Institution not found');
  }

  private async ensureCourseExists(courseId: number) {
    const course = await this.prisma.course.findFirst({
      where: { course_id: courseId, is_deleted: false },
    });
    if (!course) throw new NotFoundException('Course not found');
  }

  async create(institutionId: number, dto: CreateInstitutionCourseDto, adminUserId: number) {
    await this.ensureInstitutionExists(institutionId);
    await this.ensureCourseExists(dto.courseId);

    try {
      const link = await this.prisma.institutionCourse.create({
        data: {
          institution_id: institutionId,
          course_id: dto.courseId,
          assigned_by: adminUserId,
        },
        select: INSTITUTION_COURSE_SELECT,
      });
      return { success: true, data: link };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This course is already assigned to this institution');
      }
      throw e;
    }
  }

  async findAllForInstitution(institutionId: number, dto: QueryInstitutionCourseDto) {
    await this.ensureInstitutionExists(institutionId);
    return this.paginate({ institution_id: institutionId }, dto);
  }

  async findAllForCourse(courseId: number, dto: QueryInstitutionCourseDto) {
    await this.ensureCourseExists(courseId);
    return this.paginate({ course_id: courseId }, dto);
  }

  private async paginate(
    baseWhere: Prisma.InstitutionCourseWhereInput,
    dto: QueryInstitutionCourseDto,
  ) {
    const { page = 1, limit = 20 } = dto;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.institutionCourse.findMany({
        where: baseWhere,
        select: INSTITUTION_COURSE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.institutionCourse.count({ where: baseWhere }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const link = await this.prisma.institutionCourse.findFirst({
      where: { institution_course_id: id },
      select: INSTITUTION_COURSE_SELECT,
    });

    if (!link) throw new NotFoundException('Institution course assignment not found');
    return { success: true, data: link };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.institutionCourse.delete({ where: { institution_course_id: id } });

    return { success: true, message: 'Institution course assignment deleted successfully' };
  }
}
