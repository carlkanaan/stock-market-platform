import { IsMongoId, IsNumber, Min } from 'class-validator';

export class StripeDepositDto {
  @IsMongoId()
  memberId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}
