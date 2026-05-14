import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MemberDocument = HydratedDocument<Member>;

@Schema({ timestamps: true })
export class Member {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  nationalIdNumber: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop()
  password?: string;

  @Prop()
  otpCode?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isIdentityVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  suspensionReason?: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

MemberSchema.index({ isActive: 1 });
MemberSchema.index({ isIdentityVerified: 1 });
MemberSchema.index({ createdAt: -1 });
