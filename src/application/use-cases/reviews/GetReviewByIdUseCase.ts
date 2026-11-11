import { IReviewRepository } from '../../../domain/repository/IReviewRepository';
import { Review } from '../../../domain/models/Review';
import { NotFoundError } from '../../errors/appErrors';

export class GetReviewByIdUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(id: string): Promise<Review> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError('Reseña no encontrada o ha sido eliminada');
    }
    return review;
  }
}
