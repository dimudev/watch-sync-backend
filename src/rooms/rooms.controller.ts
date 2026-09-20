import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { AddVideoDto } from './dto/add-video.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(createRoomDto.hostName);
  }

  @Get(':code')
  getRoom(@Param('code') code: string) {
    return this.roomsService.getRoom(code);
  }

  @Post(':code/join')
  joinRoom(@Param('code') code: string, @Body() joinRoomDto: JoinRoomDto) {
    return this.roomsService.joinRoom(code, joinRoomDto.username);
  }

  @Post(':code/queue')
  addVideoToQueue(
    @Param('code') code: string,
    @Body() addVideoDto: AddVideoDto,
  ) {
    return this.roomsService.addVideoToQueue(
      code,
      addVideoDto.urlOrId,
      addVideoDto.userId,
    );
  }
}
