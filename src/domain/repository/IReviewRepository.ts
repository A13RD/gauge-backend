import { Review } from '../models/Review';
import { UserStats } from '../models/UserStats';

export interface CreateReviewData {
  userId: string;
  gameId: string;
  rating: number;
  content: string;
  hoursPlayed: number;
}

export interface UpdateReviewData {
  rating?: number;
  content?: string;
  hoursPlayed?: number;
}

export interface IReviewRepository {
  create(data: CreateReviewData): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findByUser(userId: string): Promise<Review[]>;
  findAll(): Promise<Review[]>;
  update(id: string, data: UpdateReviewData): Promise<Review>;
  softDelete(id: string): Promise<void>;
  getUserStats(userId: string): Promise<UserStats>;
}
