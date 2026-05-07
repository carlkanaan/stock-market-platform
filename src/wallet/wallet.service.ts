import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { Wallet, WalletDocument } from './schemas/wallet.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {}

  async deposit(depositDto: DepositDto) {
    const wallet = await this.walletModel.findOneAndUpdate(
      { memberId: new Types.ObjectId(depositDto.memberId) },
      {
        $inc: { balance: depositDto.amount },
        $set: { lastDepositAt: new Date() },
      },
      { new: true, upsert: true },
    );

    return {
      success: true,
      message: 'Wallet credited successfully',
      data: {
        memberId: wallet.memberId,
        balance: wallet.balance,
        lastDepositAt: wallet.lastDepositAt,
      },
    };
  }

  async withdraw(withdrawDto: WithdrawDto) {
    const wallet = await this.walletModel.findOne({
      memberId: new Types.ObjectId(withdrawDto.memberId),
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.balance < withdrawDto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    if (wallet.lastDepositAt) {
      const hoursSinceLastDeposit =
        (Date.now() - wallet.lastDepositAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastDeposit < 48) {
        throw new BadRequestException(
          'Withdrawals are allowed 48 hours after the most recent deposit',
        );
      }
    }

    wallet.balance -= withdrawDto.amount;
    await wallet.save();

    return {
      success: true,
      message: 'Withdrawal processed successfully',
      data: {
        memberId: wallet.memberId,
        balance: wallet.balance,
      },
    };
  }

  async getWallet(memberId: string) {
    const wallet = await this.walletModel.findOne({
      memberId: new Types.ObjectId(memberId),
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      success: true,
      data: wallet,
    };
  }
}
