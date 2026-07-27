import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './chapter.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { CsvResultsUtil } from '../../common/utils/csv-results.util';

@Injectable()
export class ChapterService {
  private readonly logger = new Logger(ChapterService.name);

  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepo: Repository<Chapter>,
  ) {}

  async deleteAllChapters() {
    this.assertNotProduction('deleteAllChapters');
    const result = await this.chapterRepo.delete({});
    return {
      success: true,
      deleted: result.affected || 0,
    };
  }

  async importChapters() {
    this.assertNotProduction('importChapters');
    const csvPath = path.join(
      process.cwd(),
      'src',
      'database',
      'migrations',
      'Chapters.csv',
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
        const chapter = new Chapter();
        chapter.course_id = row.courseId;
        chapter.chapter_id = row.chapterId;
        
        try {
          chapter.content = JSON.parse(row.content);
        } catch (e) {
          throw new Error('Invalid JSON in content');
        }

        try {
          const parsed = JSON.parse(row.videoId);
          chapter.video_id = Array.isArray(parsed) ? parsed : [row.videoId];
        } catch (e) {
          chapter.video_id = row.videoId ? [row.videoId] : [];
        }

        await this.chapterRepo.save(chapter);

        imported++;
        results.push({ ...row, status: 'success' });
        this.logger.log(`Imported chapter: ${row.chapterId} for course ${row.courseId}`);
      } catch (e: any) {
        failed++;
        const reason = e.message ?? 'Unknown error';
        results.push({ ...row, status: 'failed', reason });
        this.logger.error(`Failed to import chapter ${row.chapterId}: ${reason}`);
      }
    }

    const headers = Object.keys(rows[0] || {});
    const writeResult = CsvResultsUtil.writeMigrationResults('chapters', results, headers);

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
