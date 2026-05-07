import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn =
          configService.get<StringValue>('JWT_EXPIRES_IN') || '1d';

        return {
          secret: configService.get<string>('JWT_SECRET') || 'dev-secret',
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  exports: [JwtModule],
})
export class JwtConfigModule {}
