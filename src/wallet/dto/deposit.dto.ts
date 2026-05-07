import { IsMongoId, IsNumber, Min } from 'class-validator';

export class DepositDto {
  @IsMongoId()
  memberId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}
