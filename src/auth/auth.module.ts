import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CmsUsersModule } from '../cms-users/cms-users.module';
import { JwtConfigModule } from '../common/jwt/jwt-config.module';

@Module({
  imports: [CmsUsersModule, JwtConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
