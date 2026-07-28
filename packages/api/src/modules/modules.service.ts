import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

const MODULE_SELECT = {
  module_id: true,
  course_id: true,
  module_name: true,
  module_description: true,
  module_order: true,
  created_at: true,
  _count: { select: { lectures: true } },
} satisfies Prisma.ModuleSelect;

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(courseId: number, dto: CreateModuleDto) {
    let order = dto.moduleOrder;
    if (order === undefined) {
      const agg = await this.prisma.module.aggregate({
        where: { course_id: courseId, is_deleted: false },
        _max: { module_order: true },
      });
      order = (agg._max.module_order ?? 0) + 1;
    }

    const module = await this.prisma.module.create({
      data: {
        course_id: courseId,
        module_name: dto.moduleName,
        module_description: dto.moduleDescription,
        module_order: order,
      },
      select: MODULE_SELECT,
    });
    return { success: true, data: module };
  }

  async findByCourse(courseId: number) {
    const modules = await this.prisma.module.findMany({
      where: { course_id: courseId, is_deleted: false },
      select: MODULE_SELECT,
      orderBy: { module_order: 'asc' },
    });
    return { success: true, data: modules };
  }

  async findOne(id: number) {
    const module = await this.prisma.module.findFirst({
      where: { module_id: id, is_deleted: false },
      select: MODULE_SELECT,
    });
    if (!module) throw new NotFoundException('Module not found');
    return { success: true, data: module };
  }

  async update(id: number, dto: UpdateModuleDto) {
    await this.findOne(id);
    const module = await this.prisma.module.update({
      where: { module_id: id },
      data: {
        ...(dto.moduleName !== undefined && { module_name: dto.moduleName }),
        ...(dto.moduleDescription !== undefined && {
          module_description: dto.moduleDescription,
        }),
        ...(dto.moduleOrder !== undefined && { module_order: dto.moduleOrder }),
      },
      select: MODULE_SELECT,
    });
    return { success: true, data: module };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.module.update({
      where: { module_id: id },
      data: { is_deleted: true, deleted_at: new Date() },
    });
    return { success: true, message: 'Module deleted successfully' };
  }
}
