import { IsString, IsUrl, MaxLength, Min, MinLength } from 'class-validator';

export class CreateWishDto {
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @Min(1)
  price: number;

  @IsString()
  description: string;
}
