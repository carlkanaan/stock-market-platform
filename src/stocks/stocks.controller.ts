import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StocksService } from './stocks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../types/user-role.enum';

@Controller('stocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  create(@Body() createStockDto: CreateStockDto) {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.SUPPORT_AGENT)
  findAll() {
    return this.stocksService.findAll();
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stocksService.update(id, updateStockDto);
  }

  @Patch(':id/delist')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  delist(@Param('id') id: string) {
    return this.stocksService.delist(id);
  }

  @Get(':id/price-history')
  @Roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.SUPPORT_AGENT)
  getPriceHistory(@Param('id') id: string) {
    return this.stocksService.getPriceHistory(id);
  }
}
