export interface YouTubeThumbnail {
  url: string;
}

export interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails?: {
      high?: YouTubeThumbnail;
      default?: YouTubeThumbnail;
    };
  };
}

export interface YouTubeApiResponse {
  items?: YouTubeVideoItem[];
}

export interface YouTubeVideoMetadata {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  channelTitle: string;
}
