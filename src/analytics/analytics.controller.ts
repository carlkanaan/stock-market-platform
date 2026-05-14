import { Controller, Get, Query } from '@nestjs/common';

import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('volume')
  getTradingVolume(
    @Query('stock_id') stockId: string,
    @Query('granularity') granularity: 'day' | 'month',
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.analyticsService.getTradingVolume(
      stockId,
      granularity,
      from,
      to,
    );
  }

  @Get('stocks/top')
  getTopTradedStocks(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.analyticsService.getTopTradedStocks(
      Number(limit) || 5,
      Number(page) || 1,
    );
  }

  @Get('members/active')
  getMostActiveMembers(
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getMostActiveMembers(
      Number(days) || 30,
      Number(limit) || 10,
    );
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
