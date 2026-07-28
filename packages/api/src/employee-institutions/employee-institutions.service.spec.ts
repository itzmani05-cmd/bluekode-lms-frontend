import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeeInstitutionStatus, Prisma } from '@prisma/client';
import { EmployeeInstitutionsService } from './employee-institutions.service';
import { PrismaService } from 'src/prisma/prisma.service';

const mockInstitution = { institution_id: 1, is_deleted: false };
const mockEmployeeProfile = { employee_profile_id: 1 };

const mockAssignment = {
  employee_institution_id: 1,
  employee_profile_id: 1,
  institution_id: 1,
  project_lead_employee_id: null,
  technical_lead_employee_id: null,
  assigned_date: new Date(),
  status: EmployeeInstitutionStatus.ACTIVE,
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

const mockPrisma = {
  institution: { findFirst: jest.fn() },
  employeeProfile: { findFirst: jest.fn() },
  employeeInstitution: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('EmployeeInstitutionsService', () => {
  let service: EmployeeInstitutionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeInstitutionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EmployeeInstitutionsService>(
      EmployeeInstitutionsService,
    );
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { employeeProfileId: 1 };

    it('creates and returns an assignment', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(
        mockEmployeeProfile,
      );
      mockPrisma.employeeInstitution.create.mockResolvedValue(mockAssignment);

      const result = await service.create(1, dto, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAssignment);
    });

    it('throws NotFoundException when the institution does not exist', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(null);
      await expect(service.create(1, dto as any, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the employee profile does not exist', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(null);
      await expect(service.create(1, dto as any, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when already assigned', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(
        mockEmployeeProfile,
      );
      mockPrisma.employeeInstitution.create.mockRejectedValue(uniqueViolation);

      await expect(service.create(1, dto as any, 1)).rejects.toThrow(
        ConflictException,
      );
    });

    it('validates projectLeadEmployeeId when provided', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.employeeProfile.findFirst
        .mockResolvedValueOnce(mockEmployeeProfile)
        .mockResolvedValueOnce(null);

      await expect(
        service.create(
          1,
          { employeeProfileId: 1, projectLeadEmployeeId: 99 } as any,
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllForInstitution', () => {
    it('returns paginated assignments', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue(mockInstitution);
      mockPrisma.$transaction.mockResolvedValue([[mockAssignment], 1]);

      const result = await service.findAllForInstitution(1, {
        page: 1,
        limit: 20,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findAllForEmployee', () => {
    it('returns paginated assignments', async () => {
      mockPrisma.employeeProfile.findFirst.mockResolvedValue(
        mockEmployeeProfile,
      );
      mockPrisma.$transaction.mockResolvedValue([[mockAssignment], 1]);

      const result = await service.findAllForEmployee(1, {
        page: 1,
        limit: 20,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns an assignment when found', async () => {
      mockPrisma.employeeInstitution.findFirst.mockResolvedValue(
        mockAssignment,
      );
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.employeeInstitution.findFirst.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the assignment', async () => {
      mockPrisma.employeeInstitution.findFirst.mockResolvedValue(
        mockAssignment,
      );
      mockPrisma.employeeInstitution.update.mockResolvedValue({
        ...mockAssignment,
        status: EmployeeInstitutionStatus.INACTIVE,
      });

      const result = await service.update(1, { status: 'INACTIVE' } as any, 1);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe(EmployeeInstitutionStatus.INACTIVE);
    });

    it('throws NotFoundException when the assignment does not exist', async () => {
      mockPrisma.employeeInstitution.findFirst.mockResolvedValue(null);
      await expect(service.update(999, {} as any, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes the assignment', async () => {
      mockPrisma.employeeInstitution.findFirst.mockResolvedValue(
        mockAssignment,
      );
      mockPrisma.employeeInstitution.delete.mockResolvedValue({});

      const result = await service.remove(1);

      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.employeeInstitution.findFirst.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
