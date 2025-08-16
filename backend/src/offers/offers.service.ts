import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id: createOfferDto.itemId },
      relations: ['owner'],
    });
    if (!wish) {
      throw new NotFoundException('Wish not found');
    }
    if (wish.owner.id === userId) {
      throw new ConflictException('You cannot offer to your own wish');
    }
    if (wish.raised + createOfferDto.amount > wish.price) {
      throw new ConflictException('You cannot offer more than the wish price');
    }

    const offer = this.offerRepository.create({
      ...createOfferDto,
      user: { id: userId },
      item: wish,
    });

    const savedOffer = await this.offerRepository.save(offer);

    await this.wishRepository.update(wish.id, {
      raised: wish.raised + createOfferDto.amount,
    });

    return savedOffer;
  }

  async getAll(userId: number) {
    const offers = await this.offerRepository.find({
      relations: ['user', 'item'],
    });

    return offers.map((offer) => {
      const isOwnOfferOrWish =
        offer.user.id === userId || offer.item.owner.id === userId;
      return {
        ...offer,
        user: offer.hidden && !isOwnOfferOrWish ? undefined : offer.user,
      };
    });
  }

  async findOne(id: number, userId: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['user', 'item'],
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    const isOwnOfferOrWish =
      offer.user.id === userId || offer.item.owner.id === userId;
    const isHidden = offer.hidden && !isOwnOfferOrWish;
    if (isHidden) {
      throw new ForbiddenException('You are not allowed to see this offer');
    }
    return offer;
  }
}
