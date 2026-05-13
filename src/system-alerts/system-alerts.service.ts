import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SystemAlert,
  SystemAlertDocument,
} from './schemas/system-alert.schema';

import { Wallet, WalletDocument } from '../wallet/schemas/wallet.schema';

type PopulatedMember = {
  _id: string;
  fullName: string;
};

@Injectable()
export class SystemAlertsService {
  constructor(
    @InjectModel(SystemAlert.name)
    private readonly systemAlertModel: Model<SystemAlertDocument>,

    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {}

  // Scheduled cron job to check negative balances every day at midnight
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
      const member = wallet.memberId as unknown as PopulatedMember;

      await this.systemAlertModel.create({
        type: 'NEGATIVE_WALLET',
        message: `Negative wallet balance detected for ${member.fullName} with id number (${member._id})`,
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
}
