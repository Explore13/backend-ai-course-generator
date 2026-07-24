import { Controller, Delete, Post } from '@nestjs/common';
import { ClerkService } from './clerk.service';

@Controller('clerk')
export class ClerkController {
  constructor(private readonly clerkService: ClerkService) {}

  @Delete('users/delete')
  deleteAllUsers() {
    return this.clerkService.deleteAllUsers();
  }

  @Post('users/import')
  importUsers() {
    return this.clerkService.importUsers();
  }
}
