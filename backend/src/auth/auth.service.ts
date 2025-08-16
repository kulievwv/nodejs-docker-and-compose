import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { HashService } from '../hash/hash.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id, username: user.username };

    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }

    const isValidPassword = await this.hashService.verifyPassword(
      password,
      user.password,
    );

    if (isValidPassword) {
      return user;
    }

    return null;
  }

  async signup(createUserDto: CreateUserDto) {
    const existingUserName = await this.usersService.findUserByEmailOrUsername(
      createUserDto.username,
    );
    const existingUserEmail = await this.usersService.findUserByEmailOrUsername(
      createUserDto.email,
    );
    if (existingUserName.length || existingUserEmail.length) {
      throw new ConflictException(
        'Пользователь с таким username или email уже существует',
      );
    }
    const passwordHash = await this.hashService.hashPassword(
      createUserDto.password,
    );
    const user = await this.usersService.create({
      ...createUserDto,
      password: passwordHash,
    });

    this.auth(user);
    return user;
  }

  async signin(signInDto: SignInDto) {
    const { username, password } = signInDto;
    const user = await this.validatePassword(username, password);

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return this.auth(user);
  }
}
