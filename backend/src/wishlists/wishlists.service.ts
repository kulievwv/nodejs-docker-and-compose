import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, userId: number) {
    const wishes = await this.wishRepository.find({
      where: { id: In(createWishlistDto.itemsId) },
      relations: ['owner', 'offers', 'wishlists'],
    });
    const hasNotOwnWishes = wishes.some((wish) => wish.owner.id !== userId);
    if (hasNotOwnWishes || wishes.length !== createWishlistDto.itemsId.length) {
      throw new ForbiddenException(
        'You cannot add wishes that are not yours or wishes that do not exist',
      );
    }
    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      owner: { id: userId },
      items: wishes,
    });
    return await this.wishlistRepository.save(wishlist);
  }

  async findAll() {
    return await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });
  }

  async findOne(id: number) {
    return await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this wishlist');
    }
    await this.wishlistRepository.update(id, updateWishlistDto);
    return await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }

  async remove(id: number, userId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this wishlist');
    }
    return await this.wishlistRepository.delete({ id });
  }
}
