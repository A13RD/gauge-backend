import { Game } from './Game';

export interface ReviewAuthor {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  userId: string;
  user?: ReviewAuthor;
  gameId: string;
  game?: Game;
  rating: number;
  content: string;
  hoursPlayed: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
