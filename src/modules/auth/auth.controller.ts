import { Controller, Post, type RawBodyRequest, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/webhook/clerk')
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    // const sizeInBytes = Number(req.headers['content-length']);
    // const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    // console.log(` Size : ${sizeInKB} KB`);

    return this.authService.handleWebhook(req)
  }
}
