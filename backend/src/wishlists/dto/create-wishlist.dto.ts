import { IsArray, IsUrl, MaxLength } from 'class-validator';

export class CreateWishlistDto {
  @MaxLength(250)
  name: string;

  @IsUrl()
  image: string;

  @IsArray()
  itemsId: number[];
}
