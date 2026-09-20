export interface IRoom {
  code: string;
  hostId: string;
  users: Map<string, IUser>;
  queue: IPlaylistItem[];
  currentVideoId: string | null;
  isPlaying: boolean;
  currentTime: number;
}

export interface IUser {
  id: string;
  username: string;
  socketId: string;
  isHost: boolean;
  canControl: boolean;
}

export interface IPlaylistItem {
  id: string;
  youtubeId: string;
  title: string;
  thumbnail?: string;
  addedByUserId: string;
  addedByUsername: string;
}
