import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletService } from './wallet.service';
import { ManualWalletAdjustmentDto } from './dto/manual-wallet-adjustment.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  deposit(@Body() depositDto: DepositDto) {
    return this.walletService.deposit(depositDto);
  }

  @Post('withdraw')
  withdraw(@Body() withdrawDto: WithdrawDto) {
    return this.walletService.withdraw(withdrawDto);
  }

  @Get('withdrawals/pending')
  getPendingWithdrawals() {
    return this.walletService.getPendingWithdrawals();
  }

  @Patch('withdrawals/:id/approve')
  approveWithdrawal(@Param('id') id: string) {
    return this.walletService.approveWithdrawal(id);
  }

  @Patch('withdrawals/:id/reject')
  rejectWithdrawal(@Param('id') id: string, @Body('reason') reason: string) {
    return this.walletService.rejectWithdrawal(id, reason);
  }

  @Post('manual-adjustment')
  manualAdjustment(
    @Body() manualWalletAdjustmentDto: ManualWalletAdjustmentDto,
  ) {
    return this.walletService.manualAdjustment(manualWalletAdjustmentDto);
  }

  @Get(':memberId')
  getWallet(@Param('memberId') memberId: string) {
    return this.walletService.getWallet(memberId);
  }

  @Get('transactions/:memberId')
  getWalletTransactions(@Param('memberId') memberId: string) {
    return this.walletService.getWalletTransactions(memberId);
  }
}
