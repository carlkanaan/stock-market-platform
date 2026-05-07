import { Module } from '@nestjs/common';
import { PriceAlertsService } from './price-alerts.service';

@Module({
  providers: [PriceAlertsService]
})
export class PriceAlertsModule {}
