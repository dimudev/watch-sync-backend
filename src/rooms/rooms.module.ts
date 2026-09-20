import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Module } from '@nestjs/common';
import { YoutubeModule } from '@/youtube/youtube.module';
import { RoomsGateway } from './rooms.gateway';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
  imports: [YoutubeModule],
})
export class RoomsModule {}
