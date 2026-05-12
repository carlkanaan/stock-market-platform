import { IsEnum, IsMongoId, IsNumber, Min } from 'class-validator';

import { AlertDirection } from '../schemas/price-alert.schema';

export class CreatePriceAlertDto {
  @IsMongoId()
  memberId: string;

  @IsMongoId()
  stockId: string;

  @IsNumber()
  @Min(0)
  targetPrice: number;

  @IsEnum(AlertDirection)
  direction: AlertDirection;
}
