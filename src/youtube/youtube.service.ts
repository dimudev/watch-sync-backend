import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { extractVideoId } from './utils/extract-video-id.util';
import {
  YouTubeApiResponse,
  YouTubeVideoMetadata,
} from './interfaces/youtube.interface';

@Injectable()
export class YoutubeService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getVideoMetadata(input: string): Promise<YouTubeVideoMetadata> {
    const videoId = extractVideoId(input);
    if (!videoId) {
      throw new BadRequestException('Invalid YouTube URL or Video ID');
    }

    const apiKey = this.configService.get<string>('YOUTUBE_API_KEY');

    try {
      const response = await firstValueFrom(
        this.httpService.get<YouTubeApiResponse>(
          'https://www.googleapis.com/youtube/v3/videos',
          {
            params: {
              id: videoId,
              key: apiKey,
              part: 'snippet',
            },
          },
        ),
      );

      const data = response.data;

      if (!data.items || data.items.length === 0) {
        throw new NotFoundException(
          `YouTube video with ID ${videoId} not found`,
        );
      }

      const item = data.items[0];

      return {
        id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails?.high?.url ??
          item.snippet.thumbnails?.default?.url,
        channelTitle: item.snippet.channelTitle,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching YouTube metadata');
    }
  }
}
