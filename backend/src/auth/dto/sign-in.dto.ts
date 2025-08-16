import { MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @MinLength(1)
  @MaxLength(64)
  username: string;

  @MinLength(2)
  password: string;
}
