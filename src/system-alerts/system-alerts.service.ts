import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SystemAlert,
  SystemAlertDocument,
} from './schemas/system-alert.schema';

import { Wallet, WalletDocument } from '../wallet/schemas/wallet.schema';

@Injectable()
export class SystemAlertsService {
  constructor(
    @InjectModel(SystemAlert.name)
    private readonly systemAlertModel: Model<SystemAlertDocument>,

    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {}
  //scheduled cron-job to check negative balances at midnight everyday
  @Cron('0 0 * * *')
  async checkNegativeWalletBalances() {
    const negativeWallets = await this.walletModel
      .find({
        balance: { $lt: 0 },
      })
      .populate('memberId', 'fullName');

    await this.systemAlertModel.deleteMany({
      type: 'NEGATIVE_WALLET',
    });

    for (const wallet of negativeWallets) {
      await this.systemAlertModel.create({
        type: 'NEGATIVE_WALLET',
        message: `Negative wallet balance detected for ${(wallet.memberId as any).fullName} with id number (${(wallet.memberId as any)._id})`,
        isActive: true,
      });
    }
  }

  async getAlerts() {
    const alerts = await this.systemAlertModel
      .find({ isActive: true })
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: alerts,
    };
  }
  //This function is added to display response directly on Postman in order not to wait till midnight
  /**async onModuleInit() {       
    await this.checkNegativeWalletBalances();
  }**/
}
