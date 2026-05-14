import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
}

export type CmsUserDocument = HydratedDocument<CmsUser>;

@Schema({ timestamps: true })
export class CmsUser {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    required: true,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;
}

export const CmsUserSchema = SchemaFactory.createForClass(CmsUser);

CmsUserSchema.index({ role: 1 });
CmsUserSchema.index({ isActive: 1 });
