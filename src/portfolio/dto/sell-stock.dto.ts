import { IsMongoId, IsNumber, Min } from 'class-validator';

export class SellStockDto {
  @IsMongoId()
  memberId: string;

  @IsMongoId()
  stockId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
