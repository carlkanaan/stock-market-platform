import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CmsUsersController } from './cms-users.controller';
import { CmsUsersService } from './cms-users.service';
import { CmsUser, CmsUserSchema } from './schemas/cms-user.schema';
import { JwtConfigModule } from '../common/jwt/jwt-config.module';

@Module({
  imports: [
    JwtConfigModule,
    MongooseModule.forFeature([{ name: CmsUser.name, schema: CmsUserSchema }]),
  ],
  controllers: [CmsUsersController],
  providers: [CmsUsersService],
  exports: [CmsUsersService],
})
export class CmsUsersModule {}
