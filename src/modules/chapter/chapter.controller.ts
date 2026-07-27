import { Controller, Delete, Post } from '@nestjs/common';
import { ChapterService } from './chapter.service';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) { }

  @Delete('delete')
  deleteAll() {
    return this.chapterService.deleteAllChapters();
  }

  @Post('import')
  importData() {
    return this.chapterService.importChapters();
  }
}
