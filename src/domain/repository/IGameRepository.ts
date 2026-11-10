import { Game } from '../models/Game';
import { GameFilterOptions, PaginatedResult } from '../models/Pagination';

export interface CreateGameData {
  title: string;
  description: string;
  coverUrl: string;
  bannerUrl?: string | null;
  releaseDate: Date;
  genreId: string;
}

export interface UpdateGameData {
  title?: string;
  description?: string;
  coverUrl?: string;
  bannerUrl?: string | null;
  releaseDate?: Date;
  genreId?: string;
}

export interface IGameRepository {
  findMany(options: GameFilterOptions): Promise<PaginatedResult<Game>>;
  findById(id: string): Promise<Game | null>;
  create(data: CreateGameData): Promise<Game>;
  update(id: string, data: UpdateGameData): Promise<Game>;
  softDelete(id: string): Promise<void>;
}
