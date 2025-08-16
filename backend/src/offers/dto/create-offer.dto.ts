import { IsOptional, Min, IsNumber, IsPositive } from 'class-validator';

export class CreateOfferDto {
  @Min(1)
  amount: number;

  @IsOptional()
  hidden: boolean;

  @IsNumber()
  @IsPositive()
  itemId: number;
}
