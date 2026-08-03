import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentTypeEnum, CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';

const LECTURE_SELECT = {
  lecture_id: true,
  module_id: true,
  content_type: true,
  title: true,
  description: true,
  content: true,
  display_order: true,
  lecture_status: true,
  pdf_url: true,
  estimated_duration_minutes: true,
  due_date: true,
  max_marks: true,
  assignment_status: true,
  late_submission_allowed: true,
  late_submission_deadline: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.LectureSelect;

@Injectable()
export class LecturesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(moduleId: number, dto: CreateLectureDto) {
    let order = dto.displayOrder;
    if (order === undefined) {
      const agg = await this.prisma.lecture.aggregate({
        where: { module_id: moduleId, is_deleted: false },
        _max: { display_order: true },
      });
      order = (agg._max.display_order ?? 0) + 1;
    }

    const lecture = await this.prisma.lecture.create({
      data: {
        module_id: moduleId,
        content_type: dto.contentType,
        title: dto.title,
        description: dto.description,
        content: dto.content,
        display_order: order,
        lecture_status: dto.lectureStatus ?? 'DRAFT',
        pdf_url:
          dto.contentType === ContentTypeEnum.ASSIGNMENT ? null : dto.pdfUrl,
        estimated_duration_minutes: dto.estimatedDurationMinutes,
        due_date: dto.dueDate ? new Date(dto.dueDate) : undefined,
        max_marks: dto.maxMarks,
      },
      select: LECTURE_SELECT,
    });
    return { success: true, data: lecture };
  }

  async findByModule(moduleId: number) {
    const lectures = await this.prisma.lecture.findMany({
      where: { module_id: moduleId, is_deleted: false },
      select: LECTURE_SELECT,
      orderBy: { display_order: 'asc' },
    });
    return { success: true, data: lectures };
  }

  async findOne(id: number) {
    const lecture = await this.prisma.lecture.findFirst({
      where: { lecture_id: id, is_deleted: false },
      select: LECTURE_SELECT,
    });
    if (!lecture) throw new NotFoundException('Lecture not found');
    return { success: true, data: lecture };
  }

  async update(id: number, dto: UpdateLectureDto) {
    const existing = await this.findOne(id);
    const effectiveContentType = dto.contentType ?? existing.data.content_type;
    const isAssignment = effectiveContentType === ContentTypeEnum.ASSIGNMENT;

    const lecture = await this.prisma.lecture.update({
      where: { lecture_id: id },
      data: {
        ...(dto.contentType !== undefined && {
          content_type: dto.contentType,
        }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.displayOrder !== undefined && {
          display_order: dto.displayOrder,
        }),
        ...(dto.lectureStatus !== undefined && {
          lecture_status: dto.lectureStatus,
        }),
        ...(isAssignment
          ? { pdf_url: null }
          : dto.pdfUrl !== undefined && { pdf_url: dto.pdfUrl }),
        ...(dto.estimatedDurationMinutes !== undefined && {
          estimated_duration_minutes: dto.estimatedDurationMinutes,
        }),
        ...(dto.dueDate !== undefined && {
          due_date: dto.dueDate ? new Date(dto.dueDate) : null,
        }),
        ...(dto.maxMarks !== undefined && { max_marks: dto.maxMarks }),
      },
      select: LECTURE_SELECT,
    });
    return { success: true, data: lecture };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.lecture.update({
      where: { lecture_id: id },
      data: { is_deleted: true, deleted_at: new Date() },
    });
    return { success: true, message: 'Lecture deleted successfully' };
  }
}
