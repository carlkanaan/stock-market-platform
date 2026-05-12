import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  findAll() {
    return this.stocksService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stocksService.update(id, updateStockDto);
  }

  @Patch(':id/delist')
  delist(@Param('id') id: string) {
    return this.stocksService.delist(id);
  }

  @Get(':id/price-history')
  getPriceHistory(@Param('id') id: string) {
    return this.stocksService.getPriceHistory(id);
  }
}
