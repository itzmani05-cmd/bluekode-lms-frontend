import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeProfilesController } from './employee-profiles.controller';
import { EmployeeProfilesService } from './employee-profiles.service';

const mockUser = { sub: 1, email: 'admin@bluekode.com', roles: ['Admin'] };

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EmployeeProfilesController', () => {
  let controller: EmployeeProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeProfilesController],
      providers: [{ provide: EmployeeProfilesService, useValue: mockService }],
    }).compile();

    controller = module.get<EmployeeProfilesController>(EmployeeProfilesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create — delegates to service with userId, dto, and admin id', async () => {
    const dto = { designation: 'Trainer' };
    mockService.create.mockResolvedValue({ success: true, data: {} });
    await controller.create(2, dto, mockUser);
    expect(mockService.create).toHaveBeenCalledWith(2, dto, mockUser.sub);
  });

  it('findByUser — passes userId to service', async () => {
    mockService.findByUser.mockResolvedValue({ success: true, data: {} });
    await controller.findByUser(2);
    expect(mockService.findByUser).toHaveBeenCalledWith(2);
  });

  it('findAll — delegates to service with query', async () => {
    mockService.findAll.mockResolvedValue({ success: true, data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 10 });
    expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('findOne — passes parsed int id to service', async () => {
    mockService.findOne.mockResolvedValue({ success: true, data: {} });
    await controller.findOne(1);
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('update — passes id, dto, and admin id to service', async () => {
    mockService.update.mockResolvedValue({ success: true, data: {} });
    await controller.update(1, { isActive: false }, mockUser);
    expect(mockService.update).toHaveBeenCalledWith(1, { isActive: false }, mockUser.sub);
  });

  it('remove — passes id to service', async () => {
    mockService.remove.mockResolvedValue({ success: true, message: 'deleted' });
    await controller.remove(1);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
