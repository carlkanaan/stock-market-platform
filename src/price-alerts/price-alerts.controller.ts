import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreatePriceAlertDto } from './dto/create-price-alert.dto';
import { PriceAlertsService } from './price-alerts.service';

@Controller('price-alerts')
export class PriceAlertsController {
  constructor(private readonly priceAlertsService: PriceAlertsService) {}

  @Post()
  create(@Body() createPriceAlertDto: CreatePriceAlertDto) {
    return this.priceAlertsService.create(createPriceAlertDto);
  }

  @Get(':memberId')
  findMemberAlerts(@Param('memberId') memberId: string) {
    return this.priceAlertsService.findMemberAlerts(memberId);
  }
}
