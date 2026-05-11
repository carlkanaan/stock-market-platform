import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import {
  WithdrawalRequest,
  WithdrawalRequestSchema,
} from './schemas/withdrawal-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      {
        name: WithdrawalRequest.name,
        schema: WithdrawalRequestSchema,
      },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
