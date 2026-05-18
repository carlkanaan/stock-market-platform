import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationEventsService {
  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  emitTradeExecutedEvent(data: unknown) {
    return this.client.emit('trade.executed', data);
  }

  emitWalletCreditedEvent(data: unknown) {
    return this.client.emit('wallet.credited', data);
  }

  emitPriceAlertTriggeredEvent(data: unknown) {
    return this.client.emit('price.alert.triggered', data);
  }
}
