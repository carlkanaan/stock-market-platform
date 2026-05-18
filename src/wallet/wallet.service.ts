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
import { EmailService } from '../notifications/email.service';
import { Member, MemberDocument } from '../members/schemas/member.schema';

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

import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeDepositDto } from './dto/stripe-deposit.dto';
import { NotificationEventsService } from '../events/notification-events.service';

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

    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,
    private readonly emailService: EmailService,

    private readonly configService: ConfigService,

    private readonly notificationEventsService: NotificationEventsService,
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

    const member = await this.memberModel.findById(depositDto.memberId);

    if (member) {
      await this.emailService.sendWalletCreditEmail(
        member.email,
        depositDto.amount,
        wallet.balance,
      );
    }

    await this.notificationEventsService.emitWalletCreditedEvent({
      memberId: depositDto.memberId,
      amount: depositDto.amount,
      balance: wallet.balance,
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
  //stripe payment gateaway
  //strip checkout session creation for deposits
  async createStripeCheckoutSession(dto: StripeDepositDto) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new BadRequestException('Stripe secret key is missing');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Wallet Deposit',
            },
            unit_amount: dto.amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        memberId: dto.memberId,
        amount: dto.amount.toString(),
      },
      success_url:
        this.configService.get<string>('STRIPE_SUCCESS_URL') ??
        'http://localhost:3000/success',
      cancel_url:
        this.configService.get<string>('STRIPE_CANCEL_URL') ??
        'http://localhost:3000/cancel',
    });

    return {
      success: true,
      message: 'Stripe checkout session created',
      data: {
        url: session.url,
      },
    };
  }
  //webhooks
  async handleStripeWebhook(payload: Buffer, signature: string) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!stripeSecretKey || !webhookSecret) {
      throw new BadRequestException('Stripe configuration missing');
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Stripe webhook signature verification before processing payment events
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const memberId = session.metadata?.memberId;
      const amount = Number(session.metadata?.amount);

      if (!memberId || !amount) {
        throw new BadRequestException('Missing Stripe metadata');
      }
      const walletResponse = await this.getWallet(memberId);
      const wallet = walletResponse.data;

      // Credit member wallet only after successful Stripe payment
      wallet.balance += amount;
      await wallet.save();
      try {
        this.notificationEventsService.emitWalletCreditedEvent({
          memberId,
          amount,
          balance: wallet.balance,
        });
      } catch {
        // Do not block Stripe wallet credit if event publishing fails
      }
    }

    return {
      received: true,
    };
  }
}
