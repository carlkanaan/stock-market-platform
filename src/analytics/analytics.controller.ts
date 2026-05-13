import { Controller, Get, Query } from '@nestjs/common';

import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('trading-volume')
  getTradingVolume(
    @Query('stockId') stockId: string,
    @Query('groupBy') groupBy: 'day' | 'month',
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.analyticsService.getTradingVolume(stockId, groupBy, from, to);
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

  @Get('sector-allocation')
  getSectorAllocation() {
    return this.analyticsService.getSectorAllocation();
  }

  @Get('member-growth')
  getMemberGrowthAnalytics() {
    return this.analyticsService.getMemberGrowthAnalytics();
  }

  @Get('pending-withdrawals')
  getPendingWithdrawalMetrics() {
    return this.analyticsService.getPendingWithdrawalMetrics();
  }
}
