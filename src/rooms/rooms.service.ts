import { Injectable, NotFoundException } from '@nestjs/common';
import { IPlaylistItem, IRoom, IUser } from './interfaces/rooms.interface';
import { v4 as uuid } from 'uuid';
import { generateRoomCode } from './utils/generate-room-code.util';
import { YoutubeService } from '@/youtube/youtube.service';

@Injectable()
export class RoomsService {
  constructor(private readonly youtubeService: YoutubeService) {}

  private readonly rooms: Map<string, IRoom> = new Map();

  private formatRoomForClient(room: IRoom) {
    return {
      ...room,
      users: Array.from(room.users.values()),
    };
  }

  private findRoom(code: string): IRoom {
    const normalizedCode = code.toUpperCase();
    const room = this.rooms.get(normalizedCode);

    if (!room) {
      throw new NotFoundException(`Room with code ${normalizedCode} not found`);
    }

    return room;
  }

  createRoom(hostName: string): { roomCode: string; hostUser: IUser } {
    const roomCode = generateRoomCode();
    const hostId = uuid();

    const hostUser: IUser = {
      id: hostId,
      username: hostName,
      socketId: '',
      isHost: true,
      canControl: true,
    };

    const room: IRoom = {
      code: roomCode,
      hostId: hostId,
      users: new Map([[hostId, hostUser]]),
      queue: [],
      currentVideoId: null,
      isPlaying: false,
      currentTime: 0,
    };

    this.rooms.set(roomCode, room);

    return { roomCode, hostUser };
  }

  getRoom(code: string) {
    const room = this.findRoom(code);
    return this.formatRoomForClient(room);
  }

  joinRoom(code: string, username: string) {
    const room = this.findRoom(code);
    const guestId = uuid();
    const guestUser: IUser = {
      id: guestId,
      username,
      canControl: false,
      isHost: false,
      socketId: '',
    };

    room.users.set(guestId, guestUser);
    return { guestUser, room: this.formatRoomForClient(room) };
  }

  leaveRoom(code: string, userId: string) {
    const room = this.findRoom(code);
    room.users.delete(userId);

    if (room.users.size === 0) {
      this.rooms.delete(room.code);
    }
  }

  async addVideoToQueue(code: string, urlOrId: string, userId: string) {
    const room = this.findRoom(code);

    const user = room.users.get(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found in room`);
    }

    const videoData = await this.youtubeService.getVideoMetadata(urlOrId);

    const newItem: IPlaylistItem = {
      id: uuid(),
      youtubeId: videoData.id,
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      addedByUserId: user.id,
      addedByUsername: user.username,
    };

    room.queue.push(newItem);

    if (!room.currentVideoId) {
      room.currentVideoId = newItem.youtubeId;
    }

    return {
      addedItem: newItem,
      room: this.formatRoomForClient(room),
    };
  }

  assignSocketToUser(code: string, userId: string, socketId: string) {
    const room = this.findRoom(code);
    const user = room.users.get(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found in room`);
    }

    user.socketId = socketId;
    return this.formatRoomForClient(room);
  }
}
