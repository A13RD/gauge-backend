import { IReviewRepository } from '../../../domain/repository/IReviewRepository';
import { Review } from '../../../domain/models/Review';
import { BadRequestError } from '../../errors/appErrors';

export class GetMyReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(userId: string): Promise<Review[]> {
    if (!userId) {
      throw new BadRequestError('Usuario no autenticado');
    }
    return this.reviewRepository.findByUser(userId);
  }
}
