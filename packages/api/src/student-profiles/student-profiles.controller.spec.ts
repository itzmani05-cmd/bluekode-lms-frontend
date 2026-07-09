import { Test, TestingModule } from '@nestjs/testing';
import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesService } from './student-profiles.service';

const mockUser = { sub: 1, email: 'admin@bluekode.com', roles: ['Admin'] };

const mockStudentProfilesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('StudentProfilesController', () => {
  let controller: StudentProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentProfilesController],
      providers: [{ provide: StudentProfilesService, useValue: mockStudentProfilesService }],
    }).compile();

    controller = module.get<StudentProfilesController>(StudentProfilesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create — delegates to service with userId, dto, and admin id', async () => {
    const dto = { institutionId: 1 };
    mockStudentProfilesService.create.mockResolvedValue({ success: true, data: {} });
    await controller.create(3, dto, mockUser);
    expect(mockStudentProfilesService.create).toHaveBeenCalledWith(3, dto, mockUser.sub);
  });

  it('findByUser — passes userId to service', async () => {
    mockStudentProfilesService.findByUser.mockResolvedValue({ success: true, data: {} });
    await controller.findByUser(3);
    expect(mockStudentProfilesService.findByUser).toHaveBeenCalledWith(3);
  });

  it('findAll — delegates to service with query', async () => {
    mockStudentProfilesService.findAll.mockResolvedValue({ success: true, data: [], meta: {} });
    await controller.findAll({ page: 1, limit: 10 });
    expect(mockStudentProfilesService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('findOne — passes parsed int id to service', async () => {
    mockStudentProfilesService.findOne.mockResolvedValue({ success: true, data: {} });
    await controller.findOne(1);
    expect(mockStudentProfilesService.findOne).toHaveBeenCalledWith(1);
  });

  it('update — passes id, dto, and admin id to service', async () => {
    mockStudentProfilesService.update.mockResolvedValue({ success: true, data: {} });
    await controller.update(1, { department: 'CS' }, mockUser);
    expect(mockStudentProfilesService.update).toHaveBeenCalledWith(1, { department: 'CS' }, mockUser.sub);
  });

  it('remove — passes id to service', async () => {
    mockStudentProfilesService.remove.mockResolvedValue({ success: true, message: 'deleted' });
    await controller.remove(1);
    expect(mockStudentProfilesService.remove).toHaveBeenCalledWith(1);
  });
});
