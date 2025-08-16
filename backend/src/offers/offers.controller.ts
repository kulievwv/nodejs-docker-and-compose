import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { LocalGuard } from '../guards/local.guard';
import { RequestPayload } from 'src/constants';

@UseGuards(LocalGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Req() req: RequestPayload) {
    const userId = req.user.userId;
    return this.offersService.create(createOfferDto, userId);
  }

  @Get()
  getAll(@Req() req: RequestPayload) {
    const userId = req.user.userId;
    return this.offersService.getAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestPayload) {
    const userId = req.user.userId;
    return this.offersService.findOne(+id, userId);
  }
}
