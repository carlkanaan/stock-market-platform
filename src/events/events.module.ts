import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { NotificationEventsService } from './notification-events.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') ??
                'amqp://localhost:5672',
            ],
            queue:
              configService.get<string>('RABBITMQ_NOTIFICATION_QUEUE') ??
              'notifications_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [NotificationEventsService],
  exports: [NotificationEventsService],
})
export class EventsModule {}
