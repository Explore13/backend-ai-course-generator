import { Global, Module } from '@nestjs/common';
import { ClerkController } from './clerk.controller';
import { createClerkClient } from '@clerk/backend';
import { ClerkService } from './clerk.service';

@Global()
@Module({
  controllers: [ClerkController],
  providers: [
    {
      provide: 'CLERK_CLIENT',
      useFactory: () => {
        return createClerkClient({
          secretKey:
            process.env.NODE_ENV === 'production'
              ? process.env.CLERK_SECRET_KEY_PROD
              : process.env.CLERK_SECRET_KEY_DEV,
        });
      },
    },
    ClerkService,
  ],
  exports: ['CLERK_CLIENT'],
})
export class ClerkModule {}
