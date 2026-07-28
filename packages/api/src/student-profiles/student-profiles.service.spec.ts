import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FormStatus, Prisma } from '@prisma/client';
import { StudentProfilesService } from './student-profiles.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockStudentUser = {
  user_id: 3,
  is_deleted: false,
  userRoles: [{ role: { role_name: 'Student' } }],
};

const mockInstitution = { institution_id: 1, is_deleted: false };

const mockProfile = {
  student_profile_id: 10,
  user_id: 3,
  institution_id: 1,
  department: 'Computer Science',
  academic_year: 2026,
  form_status: FormStatus.PENDING,
  created_at: new Date(),
  updated_at: new Date(),
};

const uniqueViolation = new Prisma.PrismaClientKnownRequestError(
  'Unique constraint failed',
  {
    code: 'P2002',
    clientVersion: '7.0.0',
  },
);

const fkViolation = new Prisma.PrismaClientKnownRequestError(
  'Foreign key constraint failed',
  {
    code: 'P2003',
    clientVersion: '7.0.0',
  },
);

const mockPrisma = {
  user: { findFirst: jest.fn() },
  institution: { findFirst: jest.fn() },
  studentProfile: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('StudentProfilesService', () => {
  let service: StudentProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentProfilesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StudentProfilesService>(StudentProfilesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { institutionId: 1 };

    it('creates and returns a student profile', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockStudentUser);
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.studentProfile.create.mockResolvedValue(mockProfile);

      const result = await service.create(3, dto, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.create(3, dto as any, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when the user is not a Student', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        ...mockStudentUser,
        userRoles: [{ role: { role_name: 'Trainer' } }],
      });
      await expect(service.create(3, dto as any, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when the institution does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockStudentUser);
      mockPrisma.institution.findFirst.mockResolvedValue(null);
      await expect(service.create(3, dto as any, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when the user already has a profile', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockStudentUser);
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.studentProfile.create.mockRejectedValue(uniqueViolation);

      await expect(service.create(3, dto as any, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('returns paginated student profiles', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockProfile], 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('returns a profile when found', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      const result = await service.findOne(10);
      expect(result.success).toBe(true);
      expect(result.data.student_profile_id).toBe(10);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('returns a profile for the given user', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockProfile);
      const result = await service.findByUser(3);
      expect(result.success).toBe(true);
      expect(result.data.user_id).toBe(3);
    });

    it('throws NotFoundException when the user has no profile', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(null);
      await expect(service.findByUser(3)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the profile', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.studentProfile.update.mockResolvedValue({
        ...mockProfile,
        department: 'Updated',
      });

      const result = await service.update(10, { department: 'Updated' }, 1);

      expect(result.success).toBe(true);
      expect(result.data.department).toBe('Updated');
    });

    it('validates the new institution when institutionId changes', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.institution.findFirst.mockResolvedValue(null);

      await expect(
        service.update(10, { institutionId: 99 } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the profile does not exist', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(null);
      await expect(
        service.update(999, { department: 'x' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the profile', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.studentProfile.delete.mockResolvedValue({});

      const result = await service.remove(10);

      expect(result.success).toBe(true);
      expect(mockPrisma.studentProfile.delete).toHaveBeenCalledWith({
        where: { student_profile_id: 10 },
      });
    });

    it('throws NotFoundException when the profile does not exist', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when the profile has existing enrollments', async () => {
      mockPrisma.studentProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.studentProfile.delete.mockRejectedValue(fkViolation);

      await expect(service.remove(10)).rejects.toThrow(ConflictException);
    });
  });
});
