import {
  BadRequestException,
  Injectable,
  type RawBodyRequest,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Webhook } from 'svix';
import 'dotenv/config';
import { CLERK_EVENT } from '../../common/enums/clerk_event.enum';
import { Role } from '../../common/enums/role.enum';
import { ClerkWebhookEvent } from '../../common/interfaces/clerkWebhookEvent.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async handleWebhook(req: RawBodyRequest<Request>) {
    try {
      const event = this.verifyWebhook(req);

      switch (event.type) {
        case CLERK_EVENT.USER_CREATED: {
          const userDto = {
            clerk_id: event.data.id,
            first_name: event.data.first_name ?? undefined,
            last_name: event.data.last_name ?? undefined,
            email: event.data.email_addresses[0]?.email_address,
            phone_number: event.data.phone_numbers[0]?.phone_number,
            image_url: event.data.image_url ?? undefined,
            role: Role.User,
          };
          return await this.userService.createUser(userDto);
        }
        case CLERK_EVENT.USER_DELETED: {
          return await this.userService.deleteUser(event.data.id);
        }
        case CLERK_EVENT.USER_UPDATED: {
          const userDto = {
            first_name: event.data.first_name ?? undefined,
            last_name: event.data.last_name ?? undefined,
            email: event.data.email_addresses[0]?.email_address,
            phone_number: event.data.phone_numbers[0]?.phone_number,
            image_url: event.data.image_url ?? undefined,
          };
          return await this.userService.updateUser(event.data.id, userDto);
        }
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new BadRequestException('Error handling webhook');
    }
  }

  private verifyWebhook(req: RawBodyRequest<Request>) {
    try {
      const webhookSecret =
        process.env.NODE_ENV === 'production'
          ? process.env.CLERK_WEBHOOK_SECRET_PROD
          : process.env.CLERK_WEBHOOK_SECRET_DEV;

      if (!webhookSecret) {
        throw new BadRequestException('Missing webhook secret');
      }
      const webhook = new Webhook(webhookSecret);

      const headers = this.getSvixHeaders(req);
      if (
        !headers['svix-id'] ||
        !headers['svix-timestamp'] ||
        !headers['svix-signature']
      ) {
        throw new BadRequestException('Missing Svix headers');
      }

      const payload = req.rawBody!.toString('utf8');
      if (!payload) {
        throw new BadRequestException('Missing payload');
      }

      const event = webhook.verify(payload, headers) as ClerkWebhookEvent;
      return event;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      throw new BadRequestException('Invalid webhook');
    }
  }
  private getSvixHeaders(req: Request) {
    return {
      'svix-id': req.headers['svix-id'] as string,
      'svix-timestamp': req.headers['svix-timestamp'] as string,
      'svix-signature': req.headers['svix-signature'] as string,
    };
  }
}
