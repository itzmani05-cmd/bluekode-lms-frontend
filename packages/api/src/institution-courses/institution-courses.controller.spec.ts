import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionCoursesController } from './institution-courses.controller';
import { InstitutionCoursesService } from './institution-courses.service';

const mockUser = { sub: 1, email: 'admin@bluekode.com', roles: ['Admin'] };

const mockService = {
  create: jest.fn(),
  findAllForInstitution: jest.fn(),
  findAllForCourse: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('InstitutionCoursesController', () => {
  let controller: InstitutionCoursesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionCoursesController],
      providers: [{ provide: InstitutionCoursesService, useValue: mockService }],
    }).compile();

    controller = module.get<InstitutionCoursesController>(InstitutionCoursesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create — delegates to service with institutionId, dto, and admin id', async () => {
    const dto = { courseId: 1 };
    mockService.create.mockResolvedValue({ success: true, data: {} });
    await controller.create(1, dto, mockUser);
    expect(mockService.create).toHaveBeenCalledWith(1, dto, mockUser.sub);
  });

  it('findAllForInstitution — passes institutionId and query to service', async () => {
    mockService.findAllForInstitution.mockResolvedValue({ success: true, data: [], meta: {} });
    await controller.findAllForInstitution(1, { page: 1, limit: 10 });
    expect(mockService.findAllForInstitution).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
  });

  it('findAllForCourse — passes courseId and query to service', async () => {
    mockService.findAllForCourse.mockResolvedValue({ success: true, data: [], meta: {} });
    await controller.findAllForCourse(1, { page: 1, limit: 10 });
    expect(mockService.findAllForCourse).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
  });

  it('findOne — passes parsed int id to service', async () => {
    mockService.findOne.mockResolvedValue({ success: true, data: {} });
    await controller.findOne(1);
    expect(mockService.findOne).toHaveBeenCalledWith(1);
  });

  it('remove — passes id to service', async () => {
    mockService.remove.mockResolvedValue({ success: true, message: 'deleted' });
    await controller.remove(1);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
