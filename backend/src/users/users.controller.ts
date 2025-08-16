import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { LocalGuard } from '../guards/local.guard';
import { RequestPayload } from 'src/constants';

@UseGuards(LocalGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: RequestPayload) {
    const userId = req.user?.userId;
    return this.usersService.findById(userId);
  }

  @Patch('me')
  patchMe(@Req() req: RequestPayload, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user?.userId;
    return this.usersService.update(userId, updateUserDto);
  }

  @Get('me/wishes')
  async getMyWishes(@Req() req: RequestPayload) {
    const userId = req.user?.userId;
    return this.usersService.getWishesByUserId(userId);
  }

  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    return this.usersService.getWishesByUsername(username);
  }
  @Post('find')
  findUserByEmailOrUsername(@Body() body: { query: string }) {
    return this.usersService.findUserByEmailOrUsername(body.query);
  }
}
