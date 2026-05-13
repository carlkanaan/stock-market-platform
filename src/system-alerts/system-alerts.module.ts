import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SystemAlertsController } from './system-alerts.controller';
import { SystemAlertsService } from './system-alerts.service';

import { SystemAlert, SystemAlertSchema } from './schemas/system-alert.schema';

import { Wallet, WalletSchema } from '../wallet/schemas/wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SystemAlert.name,
        schema: SystemAlertSchema,
      },
      {
        name: Wallet.name,
        schema: WalletSchema,
      },
    ]),
  ],
  controllers: [SystemAlertsController],
  providers: [SystemAlertsService],
})
export class SystemAlertsModule {}
