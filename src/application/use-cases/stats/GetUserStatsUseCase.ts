import { IReviewRepository } from '../../../domain/repository/IReviewRepository';
import { UserStats } from '../../../domain/models/UserStats';
import { BadRequestError } from '../../errors/appErrors';

export class GetUserStatsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(userId: string): Promise<UserStats> {
    if (!userId) {
      throw new BadRequestError('ID de usuario no proporcionado');
    }
    return this.reviewRepository.getUserStats(userId);
  }
}
