import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeInstitutionsController } from './employee-institutions.controller';
import { EmployeeInstitutionsService } from './employee-institutions.service';

const mockUser = { sub: 1, email: 'admin@bluekode.com', roles: ['Admin'] };

const mockService = {
  create: jest.fn(),
  findAllForInstitution: jest.fn(),
  findAllForEmployee: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EmployeeInstitutionsController', () => {
  let controller: EmployeeInstitutionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeInstitutionsController],
      providers: [{ provide: EmployeeInstitutionsService, useValue: mockService }],
    }).compile();

    controller = module.get<EmployeeInstitutionsController>(EmployeeInstitutionsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create — delegates to service with institutionId, dto, and admin id', async () => {
    const dto = { employeeProfileId: 1 };
    mockService.create.mockResolvedValue({ success: true, data: {} });
    await controller.create(1, dto, mockUser);
    expect(mockService.create).toHaveBeenCalledWith(1, dto, mockUser.sub);
  });

  it('findAllForInstitution — passes institutionId and query to service', async () => {
    mockService.findAllForInstitution.mockResolvedValue({ success: true, data: [], meta: {} });
    await controller.findAllForInstitution(1, { page: 1, limit: 10 });
    expect(mockService.findAllForInstitution).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
  });

  it('findAllForEmployee — passes employeeProfileId and query to service', async () => {
    mockService.findAllForEmployee.mockResolvedValue({ success: true, data: [], meta: {} });
    await controller.findAllForEmployee(1, { page: 1, limit: 10 });
    expect(mockService.findAllForEmployee).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
  });

  it('findOne — passes parsed int id to service', async () => {
    mockService.findOne.mockResolvedValue({ success: true, data: {} });
    await controller.findOne(1);
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('update — passes id, dto, and admin id to service', async () => {
    mockService.update.mockResolvedValue({ success: true, data: {} });
    await controller.update(1, { status: 'INACTIVE' } as any, mockUser);
    expect(mockService.update).toHaveBeenCalledWith(1, { status: 'INACTIVE' }, mockUser.sub);
  });

  it('remove — passes id to service', async () => {
    mockService.remove.mockResolvedValue({ success: true, message: 'deleted' });
    await controller.remove(1);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
