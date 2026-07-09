import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EmployeeProfilesService } from './employee-profiles.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockTrainerUser = {
  user_id: 2,
  is_deleted: false,
  userRoles: [{ role: { role_name: 'Trainer' } }],
};

const mockProfile = {
  employee_profile_id: 1,
  user_id: 2,
  designation: 'Trainer',
  specialization: null,
  years_of_experience: null,
  joining_date: null,
  is_active: true,
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
  user: { findFirst: jest.fn() },
  employeeProfile: {
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

describe('EmployeeProfilesService', () => {
  let service: EmployeeProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeProfilesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<EmployeeProfilesService>(EmployeeProfilesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and returns an employee profile', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockTrainerUser);
      mockPrisma.employeeProfile.create.mockResolvedValue(mockProfile);

      const result = await service.create(2, { designation: 'Trainer' } as any, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.create(2, {} as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when the user has no staff role', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        ...mockTrainerUser,
        userRoles: [{ role: { role_name: 'Student' } }],
      });
      await expect(service.create(2, {} as any, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when the user already has a profile', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockTrainerUser);
      mockPrisma.employeeProfile.create.mockRejectedValue(uniqueViolation);

      await expect(service.create(2, {} as any, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('returns paginated employee profiles', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockProfile], 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns a profile when found', async () => {
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(mockProfile);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('returns a profile for the given user', async () => {
      mockPrisma.employeeProfile.findUnique.mockResolvedValue(mockProfile);
      const result = await service.findByUser(2);
      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when the user has no profile', async () => {
      mockPrisma.employeeProfile.findUnique.mockResolvedValue(null);
      await expect(service.findByUser(2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the profile', async () => {
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.employeeProfile.update.mockResolvedValue({ ...mockProfile, is_active: false });

      const result = await service.update(1, { isActive: false } as any, 1);

      expect(result.success).toBe(true);
      expect(result.data.is_active).toBe(false);
    });

    it('throws NotFoundException when the profile does not exist', async () => {
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(null);
      await expect(service.update(999, {} as any, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the profile', async () => {
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.employeeProfile.delete.mockResolvedValue({});

      const result = await service.remove(1);

      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when dependent records exist', async () => {
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(mockProfile);
      mockPrisma.employeeProfile.delete.mockRejectedValue(fkViolation);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
