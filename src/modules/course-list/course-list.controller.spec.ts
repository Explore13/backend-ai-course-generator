import { Test, TestingModule } from '@nestjs/testing';
import { CourseListController } from './course-list.controller';

describe('CourseListController', () => {
  let controller: CourseListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseListController],
    }).compile();

    controller = module.get<CourseListController>(CourseListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
