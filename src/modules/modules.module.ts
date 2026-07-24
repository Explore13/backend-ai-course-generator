import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ClerkModule } from './clerk/clerk.module';

@Module({
  imports: [AuthModule, UserModule, ClerkModule],
})
export class ModulesModule { }
