import { IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @MinLength(1)
  @MaxLength(64)
  username: string;

  @MinLength(2)
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @MinLength(0)
  @MaxLength(200)
  about: string;

  @IsOptional()
  avatar: string;
}
