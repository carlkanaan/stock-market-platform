import { Controller, Get, Param } from '@nestjs/common';

import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('member/:memberId')
  getMemberOrders(@Param('memberId') memberId: string) {
    return this.ordersService.getMemberOrders(memberId);
  }
}
