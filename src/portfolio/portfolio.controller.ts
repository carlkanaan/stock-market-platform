import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { BuyStockDto } from './dto/buy-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';

import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('buy')
  buyStock(@Body() buyStockDto: BuyStockDto) {
    return this.portfolioService.buyStock(buyStockDto);
  }

  @Post('sell')
  sellStock(@Body() sellStockDto: SellStockDto) {
    return this.portfolioService.sellStock(sellStockDto);
  }

  @Get(':memberId')
  getPortfolio(@Param('memberId') memberId: string) {
    return this.portfolioService.getPortfolio(memberId);
  }
}
