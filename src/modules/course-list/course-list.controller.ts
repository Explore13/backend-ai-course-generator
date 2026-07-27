import { Controller, Delete, Post } from '@nestjs/common';
import { CourseListService } from './course-list.service';

@Controller('course-list')
export class CourseListController {
  constructor(private readonly courseListService: CourseListService) {}

  @Delete('delete')
  deleteAll() {
    return this.courseListService.deleteAllCourseLists();
  }

  @Post('import')
  importData() {
    return this.courseListService.importCourseLists();
  }
}
