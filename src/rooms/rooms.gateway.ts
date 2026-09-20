import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';

@WebSocketGateway({ cors: true })
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  wss!: Server;

  constructor(private readonly roomsService: RoomsService) {}
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; userId: string },
  ) {
    console.log('data', data);
    const { roomCode, userId } = data;

    console.log({
      roomCode,
      userId,
    });

    const normalizedCode = roomCode.toUpperCase();

    // 1. Vinculamos el socketId con el usuario en nuestro servicio
    const updatedRoom = this.roomsService.assignSocketToUser(
      normalizedCode,
      userId,
      client.id,
    );

    // 2. Unimos la conexión de Socket.io al canal/sala
    client.join(normalizedCode);

    // 3. Emitimos a TODOS los conectados en la sala (incluyendo quien se acaba de unir)
    this.wss.to(normalizedCode).emit('room-updated', updatedRoom);

    return { success: true };
  }
}
