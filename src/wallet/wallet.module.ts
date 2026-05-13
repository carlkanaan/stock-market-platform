import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import {
  WithdrawalRequest,
  WithdrawalRequestSchema,
} from './schemas/withdrawal-request.schema';

import {
  WalletTransaction,
  WalletTransactionSchema,
} from './schemas/wallet-transaction.schema';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { JwtConfigModule } from '../common/jwt/jwt-config.module';

@Module({
  imports: [
    JwtConfigModule,
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      {
        name: WithdrawalRequest.name,
        schema: WithdrawalRequestSchema,
      },
      {
        name: WalletTransaction.name,
        schema: WalletTransactionSchema,
      },
    ]),
    AuditLogsModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
