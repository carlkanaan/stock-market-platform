import { Controller, Get, Param, Query } from '@nestjs/common';

import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('member/:memberId')
  getMemberOrders(@Param('memberId') memberId: string) {
    return this.ordersService.getMemberOrders(memberId);
  }

  @Get('member/:memberId/history')
  getFullTransactionHistory(
    @Param('memberId') memberId: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.getFullTransactionHistory(
      memberId,
      type,
      from,
      to,
    );
  }
}
