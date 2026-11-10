import { Genre } from './Genre';
import { Review } from './Review';

export interface Game {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  bannerUrl?: string | null;
  releaseDate: Date;
  genreId: string;
  genre?: Genre;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  reviews?: Review[];
  averageRating?: number | null;
}
