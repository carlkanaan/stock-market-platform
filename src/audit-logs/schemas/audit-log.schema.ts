import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  action: string;

  @Prop({ type: Types.ObjectId, ref: 'CmsUser' })
  performedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Member' })
  memberId?: Types.ObjectId;

  @Prop()
  reason?: string;

  @Prop()
  amount?: number;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ memberId: 1 });
AuditLogSchema.index({ createdAt: -1 });
