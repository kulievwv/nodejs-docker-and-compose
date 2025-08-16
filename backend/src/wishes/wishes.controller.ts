import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { LocalGuard } from '../guards/local.guard';
import { RequestPayload } from '../constants';
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(LocalGuard)
  @Post()
  create(@Body() createWishDto: CreateWishDto, @Req() req: RequestPayload) {
    const userId = req.user.userId;
    return this.wishesService.create(createWishDto, userId);
  }

  @Get('last')
  async getLast() {
    return await this.wishesService.getLast();
  }

  @Get('top')
  async getTop() {
    return await this.wishesService.getTop();
  }

  @UseGuards(LocalGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestPayload) {
    return this.wishesService.findOne(+id, req.user.userId);
  }

  @UseGuards(LocalGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req: RequestPayload,
  ) {
    const userId = req.user.userId;
    return this.wishesService.update(+id, updateWishDto, userId);
  }

  @UseGuards(LocalGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestPayload) {
    const userId = req.user.userId;
    return this.wishesService.remove(+id, userId);
  }
  @UseGuards(LocalGuard)
  @Post(':id/copy')
  copy(@Param('id') id: string, @Req() req: RequestPayload) {
    return this.wishesService.copy(+id, req.user.userId);
  }
}
