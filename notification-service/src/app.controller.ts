import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger('NotificationService');

  @EventPattern('wallet.credited')
  handleWalletCredited(@Payload() data: unknown) {
    this.logger.log(`Wallet credited event received: ${JSON.stringify(data)}`);
  }

  @EventPattern('trade.executed')
  handleTradeExecuted(@Payload() data: unknown) {
    this.logger.log(`Trade executed event received: ${JSON.stringify(data)}`);
  }

  @EventPattern('price.alert.triggered')
  handlePriceAlertTriggered(@Payload() data: unknown) {
    this.logger.log(`Price alert event received: ${JSON.stringify(data)}`);
  }
}
