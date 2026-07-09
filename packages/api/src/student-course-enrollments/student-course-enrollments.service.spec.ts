import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus, Prisma } from '@prisma/client';
import { StudentCourseEnrollmentsService } from './student-course-enrollments.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockProfile = { student_profile_id: 10, user_id: 3 };
const mockCourse = { course_id: 1, is_deleted: false };

const mockEnrollment = {
  enrollment_id: 5,
  student_profile_id: 10,
  course_id: 1,
  enrollment_status: EnrollmentStatus.ASSIGNED,
  completion_percentage: 0,
  assigned_date: new Date(),
  completed_date: null,
  created_at: new Date(),
  updated_at: new Date(),
};

const uniqueViolation = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
  code: 'P2002',
  clientVersion: '7.0.0',
});

const fkViolation = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
  code: 'P2003',
  clientVersion: '7.0.0',
});

const mockPrisma = {
  studentProfile: { findFirst: jest.fn() },
  course: { findFirst: jest.fn() },
  studentCourseEnrollment: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('StudentCourseEnrollmentsService', () => {
  let service: StudentCourseEnrollmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentCourseEnrollmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StudentCourseEnrollmentsService>(StudentCourseEnrollmentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { courseId: 1 };

    it('creates and returns an enrollment', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.course.findFirst.mockResolvedValue(mockCourse);
      mockPrisma.studentCourseEnrollment.create.mockResolvedValue(mockEnrollment);

      const result = await service.create(10, dto as any, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEnrollment);
    });

    it('throws NotFoundException when the student profile does not exist', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(null);
      await expect(service.create(10, dto as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the course does not exist', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.course.findFirst.mockResolvedValue(null);
      await expect(service.create(10, dto as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when already enrolled', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.course.findFirst.mockResolvedValue(mockCourse);
      mockPrisma.studentCourseEnrollment.create.mockRejectedValue(uniqueViolation);

      await expect(service.create(10, dto as any, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllForProfile', () => {
    it('returns paginated enrollments for a profile', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.$transaction.mockResolvedValue([[mockEnrollment], 1]);

      const result = await service.findAllForProfile(10, { page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('throws NotFoundException when the profile does not exist', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(null);
      await expect(service.findAllForProfile(999, { page: 1, limit: 20 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllForCourse', () => {
    it('returns paginated enrollments for a course', async () => {
      mockPrisma.course.findFirst.mockResolvedValue(mockCourse);
      mockPrisma.$transaction.mockResolvedValue([[mockEnrollment], 1]);

      const result = await service.findAllForCourse(1, { page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('throws NotFoundException when the course does not exist', async () => {
      mockPrisma.course.findFirst.mockResolvedValue(null);
      await expect(service.findAllForCourse(999, { page: 1, limit: 20 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('returns an enrollment when found', async () => {
      mockPrisma.studentCourseEnrollment.findFirst.mockResolvedValue(mockEnrollment);
      const result = await service.findOne(5);
      expect(result.success).toBe(true);
      expect(result.data.enrollment_id).toBe(5);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.studentCourseEnrollment.findFirst.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the enrollment', async () => {
      mockPrisma.studentCourseEnrollment.findFirst.mockResolvedValue(mockEnrollment);
      mockPrisma.studentCourseEnrollment.update.mockResolvedValue({
        ...mockEnrollment,
        enrollment_status: EnrollmentStatus.COMPLETED,
      });

      const result = await service.update(5, { enrollmentStatus: 'COMPLETED' } as any, 1);

      expect(result.success).toBe(true);
      expect(result.data.enrollment_status).toBe(EnrollmentStatus.COMPLETED);
    });

    it('throws NotFoundException when the enrollment does not exist', async () => {
      mockPrisma.studentCourseEnrollment.findFirst.mockResolvedValue(null);
      await expect(
        service.update(999, { enrollmentStatus: 'COMPLETED' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the enrollment', async () => {
      mockPrisma.studentCourseEnrollment.findFirst.mockResolvedValue(mockEnrollment);
      mockPrisma.studentCourseEnrollment.delete.mockResolvedValue({});

      const result = await service.remove(5);

      expect(result.success).toBe(true);
      expect(mockPrisma.studentCourseEnrollment.delete).toHaveBeenCalledWith({
        where: { enrollment_id: 5 },
      });
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.studentCourseEnrollment.findFirst.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when progress or submissions exist', async () => {
      mockPrisma.studentCourseEnrollment.findFirst.mockResolvedValue(mockEnrollment);
      mockPrisma.studentCourseEnrollment.delete.mockRejectedValue(fkViolation);

      await expect(service.remove(5)).rejects.toThrow(ConflictException);
    });
  });
});
