import { IsMongoId, IsNumber, Min } from 'class-validator';

export class WithdrawDto {
  @IsMongoId()
  memberId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}
