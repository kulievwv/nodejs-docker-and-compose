import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { RequestPayload } from '../constants';
import { LocalGuard } from '../guards/local.guard';

@UseGuards(LocalGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  create(
    @Body() createWishlistDto: CreateWishlistDto,
    @Req() req: RequestPayload,
  ) {
    const userId = req.user.userId;
    if (!userId) {
      throw new UnauthorizedException('User is not authorized');
    }
    return this.wishlistsService.create(createWishlistDto, userId);
  }

  @Get()
  getAll() {
    return this.wishlistsService.findAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.wishlistsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Req() req: RequestPayload,
  ) {
    const userId = req.user.userId;
    return this.wishlistsService.update(+id, updateWishlistDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestPayload) {
    const userId = req.user.userId;

    return this.wishlistsService.remove(+id, userId);
  }
}
