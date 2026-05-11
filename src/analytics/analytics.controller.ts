import { Controller, Get } from '@nestjs/common';

import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('trading-volume')
  getTradingVolume() {
    return this.analyticsService.getTradingVolume();
  }

  @Get('top-stocks')
  getTopTradedStocks() {
    return this.analyticsService.getTopTradedStocks();
  }

  @Get('active-members')
  getMostActiveMembers() {
    return this.analyticsService.getMostActiveMembers();
  }

  @Get('aum')
  getAssetsUnderManagement() {
    return this.analyticsService.getAssetsUnderManagement();
  }
}
