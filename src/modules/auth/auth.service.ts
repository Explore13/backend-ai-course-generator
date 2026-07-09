import { BadRequestException, Injectable, type RawBodyRequest } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Webhook } from 'svix';
import 'dotenv/config';
import { CLERK_EVENT } from '../../common/enums/clerk_event.enum';
import { Role } from '../../common/enums/role.enum';
import { ClerkWebhookEvent } from '../../common/interfaces/clerkWebhookEvent.interface';



@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService) { }

    async handleWebhook(req: RawBodyRequest<Request>) {
        const event = this.verifyWebhook(req)
        console.log(event);

        if (!event) throw new BadRequestException("Invalid webhook")

        switch (event.type) {
            case CLERK_EVENT.USER_CREATED:
                {
                    const userDto = {
                        clerk_id: event.data.id,
                        first_name: event.data.first_name ?? undefined,
                        last_name: event.data.last_name ?? undefined,
                        email: event.data.email_addresses[0]?.email_address,
                        phone_number: event.data.phone_numbers[0]?.phone_number,
                        image_url: event.data.image_url ?? undefined,
                        role: Role.User
                    }
                    return await this.userService.createUser(userDto)
                }
            case CLERK_EVENT.USER_DELETED:
                {
                    return await this.userService.deleteUser(event.data.id)
                } case CLERK_EVENT.USER_UPDATED:
                {
                    const userDto = {
                        first_name: event.data.first_name ?? undefined,
                        last_name: event.data.last_name ?? undefined,
                        email: event.data.email_addresses[0]?.email_address,
                        phone_number: event.data.phone_numbers[0]?.phone_number,
                        image_url: event.data.image_url ?? undefined,
                    }
                    return await this.userService.updateUser(event.data.id, userDto)
                }
        }
    }


    private verifyWebhook(req: RawBodyRequest<Request>) {

        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

        const headers = this.getSvixHeaders(req)

        const payload = req.rawBody!.toString('utf8');

        const event = webhook.verify(payload, headers) as ClerkWebhookEvent

        return event
    }
    private getSvixHeaders(req: Request) {
        return {
            'svix-id': req.headers['svix-id'] as string,
            'svix-timestamp': req.headers['svix-timestamp'] as string,
            'svix-signature': req.headers['svix-signature'] as string,
        };
    }

}