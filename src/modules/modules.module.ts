import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ClerkModule } from './clerk/clerk.module';
import { CourseListModule } from './course-list/course-list.module';
import { ChapterModule } from './chapter/chapter.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ClerkModule,
    CourseListModule,
    ChapterModule,
  ],
})
export class ModulesModule {}
