import { Test, TestingModule } from '@nestjs/testing';
import { StudentCourseEnrollmentsController } from './student-course-enrollments.controller';
import { StudentCourseEnrollmentsService } from './student-course-enrollments.service';

const mockUser = { sub: 1, email: 'admin@bluekode.com', roles: ['Admin'] };

const mockService = {
  create: jest.fn(),
  findAllForProfile: jest.fn(),
  findAllForCourse: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('StudentCourseEnrollmentsController', () => {
  let controller: StudentCourseEnrollmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentCourseEnrollmentsController],
      providers: [{ provide: StudentCourseEnrollmentsService, useValue: mockService }],
    }).compile();

    controller = module.get<StudentCourseEnrollmentsController>(
      StudentCourseEnrollmentsController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create — delegates to service with studentProfileId, dto, and admin id', async () => {
    const dto = { courseId: 1 };
    mockService.create.mockResolvedValue({ success: true, data: {} });
    await controller.create(10, dto, mockUser);
    expect(mockService.create).toHaveBeenCalledWith(10, dto, mockUser.sub);
  });

  it('findAllForProfile — passes studentProfileId and query to service', async () => {
    mockService.findAllForProfile.mockResolvedValue({ success: true, data: [], meta: {} });
    await controller.findAllForProfile(10, { page: 1, limit: 10 });
    expect(mockService.findAllForProfile).toHaveBeenCalledWith(10, { page: 1, limit: 10 });
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

  it('update — passes id, dto, and admin id to service', async () => {
    mockService.update.mockResolvedValue({ success: true, data: {} });
    await controller.update(1, { enrollmentStatus: 'COMPLETED' } as any, mockUser);
    expect(mockService.update).toHaveBeenCalledWith(1, { enrollmentStatus: 'COMPLETED' }, mockUser.sub);
  });

  it('remove — passes id to service', async () => {
    mockService.remove.mockResolvedValue({ success: true, message: 'deleted' });
    await controller.remove(1);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
