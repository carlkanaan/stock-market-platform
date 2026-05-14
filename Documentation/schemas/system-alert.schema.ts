import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemAlertDocument = HydratedDocument<SystemAlert>;

@Schema({ timestamps: true })
export class SystemAlert {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SystemAlertSchema = SchemaFactory.createForClass(SystemAlert);

SystemAlertSchema.index({ type: 1 });
SystemAlertSchema.index({ isActive: 1 });
