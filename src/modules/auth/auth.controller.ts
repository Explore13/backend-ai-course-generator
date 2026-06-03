import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('webhook')
  handleWebhook(@Body() payload: { data: any }) {
    console.log('Received webhook payload:', payload.data);
    // Process the payload as needed
    return { message: 'Webhook received successfully' };
  }
}
