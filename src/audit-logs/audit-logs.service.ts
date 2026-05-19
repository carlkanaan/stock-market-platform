import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}
  //audit logs creation
  async createLog(data: {
    action: string;
    performedBy?: string;
    memberId?: string;
    reason?: string;
    amount?: number;
  }) {
    return this.auditLogModel.create({
      action: data.action,
      performedBy: data.performedBy
        ? new Types.ObjectId(data.performedBy)
        : undefined,
      memberId: data.memberId ? new Types.ObjectId(data.memberId) : undefined,
      reason: data.reason,
      amount: data.amount,
    });
  }

  async findAll() {
    const logs = await this.auditLogModel
      .find()
      .populate('performedBy', 'fullName email role')
      .populate('memberId', 'fullName email')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: logs,
    };
  }
}
