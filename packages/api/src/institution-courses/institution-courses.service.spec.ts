import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InstitutionCoursesService } from './institution-courses.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockInstitution = { institution_id: 1, is_deleted: false };
const mockCourse = { course_id: 1, is_deleted: false };

const mockLink = {
  institution_course_id: 1,
  institution_id: 1,
  course_id: 1,
  created_at: new Date(),
  updated_at: new Date(),
};

const uniqueViolation = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
  code: 'P2002',
  clientVersion: '7.0.0',
});

const mockPrisma = {
  institution: { findFirst: jest.fn() },
  course: { findFirst: jest.fn() },
  institutionCourse: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('InstitutionCoursesService', () => {
  let service: InstitutionCoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstitutionCoursesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<InstitutionCoursesService>(InstitutionCoursesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { courseId: 1 };

    it('creates and returns an assignment', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.course.findFirst.mockResolvedValue(mockCourse);
      mockPrisma.institutionCourse.create.mockResolvedValue(mockLink);

      const result = await service.create(1, dto as any, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLink);
    });

    it('throws NotFoundException when the institution does not exist', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(null);
      await expect(service.create(1, dto as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the course does not exist', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.course.findFirst.mockResolvedValue(null);
      await expect(service.create(1, dto as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when already assigned', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.course.findFirst.mockResolvedValue(mockCourse);
      mockPrisma.institutionCourse.create.mockRejectedValue(uniqueViolation);

      await expect(service.create(1, dto as any, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllForInstitution', () => {
    it('returns paginated assignments', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.$transaction.mockResolvedValue([[mockLink], 1]);

      const result = await service.findAllForInstitution(1, { page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findAllForCourse', () => {
    it('returns paginated assignments', async () => {
      mockPrisma.course.findFirst.mockResolvedValue(mockCourse);
      mockPrisma.$transaction.mockResolvedValue([[mockLink], 1]);

      const result = await service.findAllForCourse(1, { page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns an assignment when found', async () => {
      mockPrisma.institutionCourse.findFirst.mockResolvedValue(mockLink);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.institutionCourse.findFirst.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the assignment', async () => {
      mockPrisma.institutionCourse.findFirst.mockResolvedValue(mockLink);
      mockPrisma.institutionCourse.delete.mockResolvedValue({});

      const result = await service.remove(1);

      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.institutionCourse.findFirst.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
