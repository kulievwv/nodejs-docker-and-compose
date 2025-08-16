import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number) {
    const newWish = this.wishRepository.create({
      ...createWishDto,
      owner: { id: userId },
    });
    await this.wishRepository.save(newWish);
    return newWish;
  }

  getLast() {
    return this.wishRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner'],
    });
  }

  async getTop() {
    const wishes = await this.wishRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner'],
    });
    return wishes.map((wish) => ({
      ...wish,
      offers: null,
    }));
  }

  async findOne(id: number, reqUserId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers', 'offers.user'],
    });
    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id !== reqUserId) {
      return {
        ...wish,
        offers: wish.offers.filter((offer) => !offer.hidden),
        hidden: undefined,
      };
    }
    return wish;
  }

  async update(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });
    if (!wish) throw new NotFoundException('Wish not found');
    if (wish.owner.id !== userId)
      throw new ForbiddenException('You are not the owner of this wish');
    if (wish.offers.length > 0 && updateWishDto.price !== wish.price) {
      throw new ConflictException(
        'You cannot change the price of a wish that has offers',
      );
    }
    await this.wishRepository.update(id, { ...wish, ...updateWishDto });
    return await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  async remove(id: number, userId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!wish) throw new NotFoundException('Wish not found');
    if (wish.owner.id !== userId)
      throw new ForbiddenException('You are not the owner of this wish');
    return await this.wishRepository.delete({ id });
  }

  async copy(wishId: number, userId: number) {
    const originalWish = await this.wishRepository.findOne({
      where: { id: wishId },
    });

    if (!originalWish) {
      throw new NotFoundException('Wish not found');
    }

    const { name, description, image, link, price } = originalWish;

    await this.wishRepository.update(wishId, {
      copied: originalWish.copied + 1,
    });

    await this.create({ name, description, image, link, price }, userId);
    return {};
  }
}
