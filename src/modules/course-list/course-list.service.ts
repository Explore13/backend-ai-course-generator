import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseList } from './course-list.entity';
import { User } from '../user/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { CsvResultsUtil } from '../../common/utils/csv-results.util';

@Injectable()
export class CourseListService {
  private readonly logger = new Logger(CourseListService.name);

  constructor(
    @InjectRepository(CourseList)
    private readonly courseListRepo: Repository<CourseList>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async deleteAllCourseLists() {
    this.assertNotProduction('deleteAllCourseLists');
    const result = await this.courseListRepo.delete({});
    return {
      success: true,
      deleted: result.affected || 0,
    };
  }

  async importCourseLists() {
    this.assertNotProduction('importCourseLists');
    const csvPath = path.join(
      process.cwd(),
      'src',
      'database',
      'migrations',
      'Course List.csv',
    );

    if (!fs.existsSync(csvPath)) {
      return { imported: 0, failed: 0, error: `CSV file not found at ${csvPath}` };
    }

    let rows: any[] = [];
    try {
      rows = await new Promise((resolve, reject) => {
        const data: any[] = [];
        fs.createReadStream(csvPath)
          .pipe(csvParser())
          .on('data', (row) => data.push(row))
          .on('end', () => resolve(data))
          .on('error', reject);
      });
    } catch (error: any) {
      return { imported: 0, failed: 0, error: `Failed to read CSV: ${error.message}` };
    }

    const results: any[] = [];
    let imported = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const user = await this.userRepo.findOne({ where: { email: row.createdBy } });
        if (!user) {
          throw new Error(`User not found for email: ${row.createdBy}`);
        }

        const courseList = new CourseList();
        courseList.course_id = row.courseId;
        courseList.name = row.name;
        courseList.category = row.category;
        courseList.level = row.level;
        courseList.include_video = row.includeVideo || 'Yes';
        
        try {
          courseList.course_output = JSON.parse(row.courseOutput);
        } catch (e) {
          throw new Error('Invalid JSON in courseOutput');
        }

        courseList.clerk_id = user.clerk_id;
        courseList.course_banner = row.courseBanner || '/placeholder.png';
        courseList.publish = row.publish === 'true';

        await this.courseListRepo.save(courseList);

        imported++;
        results.push({ ...row, status: 'success' });
        this.logger.log(`Imported course: ${row.name}`);
      } catch (e: any) {
        failed++;
        const reason = e.message ?? 'Unknown error';
        results.push({ ...row, status: 'failed', reason });
        this.logger.error(`Failed to import course ${row.name}: ${reason}`);
      }
    }

    const headers = Object.keys(rows[0] || {});
    const writeResult = CsvResultsUtil.writeMigrationResults('courselist', results, headers);

    return {
      imported,
      failed,
      ...writeResult
    };
  }

  private assertNotProduction(actionName: string) {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn(`Blocked attempt to run "${actionName}" in production`);
      throw new BadRequestException('You can not use this in Production');
    }
  }
}
