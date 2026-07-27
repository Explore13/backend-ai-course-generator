import { Test, TestingModule } from '@nestjs/testing';
import { CourseListService } from './course-list.service';

describe('CourseListService', () => {
  let service: CourseListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseListService],
    }).compile();

    service = module.get<CourseListService>(CourseListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
