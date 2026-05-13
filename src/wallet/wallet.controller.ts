import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletService } from './wallet.service';
import { ManualWalletAdjustmentDto } from './dto/manual-wallet-adjustment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../types/user-role.enum';

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  deposit(@Body() depositDto: DepositDto) {
    return this.walletService.deposit(depositDto);
  }

  @Post('withdraw')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  withdraw(@Body() withdrawDto: WithdrawDto) {
    return this.walletService.withdraw(withdrawDto);
  }

  @Get('withdrawals/pending')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  getPendingWithdrawals() {
    return this.walletService.getPendingWithdrawals();
  }

  @Patch('withdrawals/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  approveWithdrawal(@Param('id') id: string) {
    return this.walletService.approveWithdrawal(id);
  }

  @Patch('withdrawals/:id/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  rejectWithdrawal(@Param('id') id: string, @Body('reason') reason: string) {
    return this.walletService.rejectWithdrawal(id, reason);
  }

  @Post('manual-adjustment')
  @Roles(UserRole.ADMIN)
  manualAdjustment(
    @Body() manualWalletAdjustmentDto: ManualWalletAdjustmentDto,
  ) {
    return this.walletService.manualAdjustment(manualWalletAdjustmentDto);
  }

  @Get(':memberId')
  @Roles(UserRole.ADMIN)
  getWallet(@Param('memberId') memberId: string) {
    return this.walletService.getWallet(memberId);
  }

  @Get('transactions/:memberId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  getWalletTransactions(@Param('memberId') memberId: string) {
    return this.walletService.getWalletTransactions(memberId);
  }
}
