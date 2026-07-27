import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseListController } from './course-list.controller';
import { CourseListService } from './course-list.service';
import { CourseList } from './course-list.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseList, User])],
  controllers: [CourseListController],
  providers: [CourseListService],
  exports: [CourseListService],
})
export class CourseListModule {}
