import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member, MemberSchema } from './schemas/member.schema';
import { JwtConfigModule } from '../common/jwt/jwt-config.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    JwtConfigModule,
    AuditLogsModule,
    NotificationsModule,
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
