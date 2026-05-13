import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export enum AdjustmentType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class ManualWalletAdjustmentDto {
  @IsMongoId()
  memberId: string;

  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
