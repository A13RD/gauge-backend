import { Genre } from '../models/Genre';

export interface CreateGenreData {
  name: string;
  slug: string;
}

export interface UpdateGenreData {
  name?: string;
  slug?: string;
}

export interface IGenreRepository {
  findAll(): Promise<Genre[]>;
  findById(id: string): Promise<Genre | null>;
  findBySlug(slug: string): Promise<Genre | null>;
  findByName(name: string): Promise<Genre | null>;
  create(data: CreateGenreData): Promise<Genre>;
  update(id: string, data: UpdateGenreData): Promise<Genre>;
  delete(id: string): Promise<void>;
  countGamesByGenre(genreId: string): Promise<number>;
}
