import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Role } from '../../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) { }
  @Post('webhook')
  async handleWebhook(@Body() payload: { type: string; data: any }) {
    console.log(payload);

    if (payload?.type === "user.created") {
      const userDto = {
        clerk_id: payload.data.id,
        first_name: payload.data.first_name,
        last_name: payload.data.last_name,
        email: payload.data?.email_addresses[0]?.email_address,
        phone_number: payload.data?.phone_numbers[0]?.phone_number,
        image_url: payload.data?.image_url,
        role: Role.User
      }
      return await this.userService.createUser(userDto)
    }

    if (payload?.type === "user.deleted") {
      return await this.userService.deleteUser(payload.data.id)
    }

    if (payload?.type === "user.updated") {
      const userDto = {
        first_name: payload.data.first_name,
        last_name: payload.data.last_name,
        email: payload.data?.email_addresses[0]?.email_address,
        phone_number: payload.data?.phone_numbers[0]?.phone_number,
        image_url: payload.data?.image_url,
      }
      return await this.userService.updateUser(payload.data.id, userDto)
    }
    console.log('Received webhook payload:', payload.data);
    // Process the payload as needed
    return { message: 'Webhook received successfully' };
  }
}
