import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PriceAlertsController } from './price-alerts.controller';
import { PriceAlertsService } from './price-alerts.service';

import { PriceAlert, PriceAlertSchema } from './schemas/price-alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceAlert.name, schema: PriceAlertSchema },
    ]),
  ],
  controllers: [PriceAlertsController],
  providers: [PriceAlertsService],
})
export class PriceAlertsModule {}
