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

import {
  WithdrawalRequest,
  WithdrawalRequestDocument,
  WithdrawalStatus,
} from './schemas/withdrawal-request.schema';

import {
  WalletTransaction,
  WalletTransactionDocument,
  WalletTransactionType,
} from './schemas/wallet-transaction.schema';

import {
  AdjustmentType,
  ManualWalletAdjustmentDto,
} from './dto/manual-wallet-adjustment.dto';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,

    @InjectModel(WithdrawalRequest.name)
    private readonly withdrawalRequestModel: Model<WithdrawalRequestDocument>,

    @InjectModel(WalletTransaction.name)
    private readonly walletTransactionModel: Model<WalletTransactionDocument>,

    private readonly auditLogsService: AuditLogsService,
  ) {}
  //deposit money in member wallet
  async deposit(depositDto: DepositDto) {
    const wallet = await this.walletModel.findOneAndUpdate(
      { memberId: new Types.ObjectId(depositDto.memberId) },
      {
        $inc: { balance: depositDto.amount },
        $set: { lastDepositAt: new Date() },
      },
      { new: true, upsert: true },
    );

    await this.walletTransactionModel.create({
      memberId: new Types.ObjectId(depositDto.memberId),
      type: WalletTransactionType.DEPOSIT,
      amount: depositDto.amount,
      status: 'COMPLETED',
      transactionDate: new Date(),
    });

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
  //perform withdrawal
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

    const request = await this.withdrawalRequestModel.create({
      memberId: new Types.ObjectId(withdrawDto.memberId),
      amount: withdrawDto.amount,
      status: WithdrawalStatus.PENDING,
    });

    return {
      success: true,
      message: 'Withdrawal request submitted for review',
      data: request,
    };
  }
  //approve withdrawals
  async approveWithdrawal(requestId: string) {
    const request = await this.withdrawalRequestModel.findById(requestId);

    if (!request) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (request.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Withdrawal request was already reviewed');
    }

    const wallet = await this.walletModel.findOne({
      memberId: request.memberId,
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.balance < request.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    wallet.balance -= request.amount;
    await wallet.save();

    await this.walletTransactionModel.create({
      memberId: request.memberId,
      type: WalletTransactionType.WITHDRAWAL,
      amount: request.amount,
      status: 'COMPLETED',
      transactionDate: new Date(),
    });

    request.status = WithdrawalStatus.APPROVED;
    request.reviewedAt = new Date();
    await request.save();

    return {
      success: true,
      message: 'Withdrawal request approved',
      data: {
        requestId: request._id,
        memberId: request.memberId,
        amount: request.amount,
        status: request.status,
        walletBalance: wallet.balance,
      },
    };
  }
  //reject withdrawal
  async rejectWithdrawal(requestId: string, reason: string) {
    const request = await this.withdrawalRequestModel.findById(requestId);

    if (!request) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (request.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Withdrawal request was already reviewed');
    }

    request.status = WithdrawalStatus.REJECTED;
    request.rejectionReason = reason;
    request.reviewedAt = new Date();
    await request.save();

    return {
      success: true,
      message: 'Withdrawal request rejected',
      data: request,
    };
  }
  //display pending withdrawals
  async getPendingWithdrawals() {
    const requests = await this.withdrawalRequestModel
      .find({ status: WithdrawalStatus.PENDING })
      .populate('memberId', 'fullName email')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: requests,
    };
  }
  //display wallet
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
  // Display deposit and withdrawal transactions for member wallet
  async getWalletTransactions(memberId: string) {
    const transactions = await this.walletTransactionModel
      .find({ memberId: new Types.ObjectId(memberId) })
      .sort({ transactionDate: -1 });

    return {
      success: true,
      data: transactions,
    };
  }
  //admin manual credit/debit adjustments
  async manualAdjustment(dto: ManualWalletAdjustmentDto) {
    const wallet = await this.walletModel.findOne({
      memberId: new Types.ObjectId(dto.memberId),
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (dto.type === AdjustmentType.DEBIT && wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    if (dto.type === AdjustmentType.CREDIT) {
      wallet.balance += dto.amount;
    } else {
      wallet.balance -= dto.amount;
    }

    await wallet.save();

    await this.auditLogsService.createLog({
      action: `MANUAL_WALLET_${dto.type}`,
      memberId: dto.memberId,
      amount: dto.amount,
      reason: dto.reason,
    });

    return {
      success: true,
      message: 'Wallet adjusted successfully',
      data: {
        memberId: wallet.memberId,
        adjustmentType: dto.type,
        amount: dto.amount,
        reason: dto.reason,
        balance: wallet.balance,
      },
    };
  }
}
