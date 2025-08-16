import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { HashService } from '../hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findByUsername(username: string) {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userPreviousData = await this.userRepository.findOne({
      where: { id },
    });
    if (!userPreviousData) {
      throw new NotFoundException('User not found');
    }
    const existingUserName =
      updateUserDto.username !== userPreviousData.username &&
      updateUserDto.username &&
      (await this.findUserByEmailOrUsername(updateUserDto.username));

    const existingUserEmail =
      updateUserDto.email !== userPreviousData.email &&
      updateUserDto.email &&
      (await this.findUserByEmailOrUsername(updateUserDto.email));

    if (existingUserName) {
      throw new ConflictException('Username already exists');
    }
    if (existingUserEmail) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = updateUserDto.password
      ? await this.hashService.hashPassword(updateUserDto.password)
      : userPreviousData?.password;
    const userNewData = {
      ...userPreviousData,
      ...updateUserDto,
      password: passwordHash,
    };

    await this.userRepository.update(id, userNewData);
    return await this.userRepository.findOne({ where: { id } });
  }

  async findUserByEmailOrUsername(query: string) {
    return await this.userRepository.find({
      where: [
        { email: ILike(`%${query}%`) },
        { username: ILike(`%${query}%`) },
      ],
    });
  }

  async getWishesByUsername(userName: string) {
    const user = await this.userRepository.findOne({
      where: { username: userName },
      relations: ['wishes'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.wishes;
  }

  async getWishesByUserId(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wishes'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.wishes;
  }
}
