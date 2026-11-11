import { IReviewRepository } from '../../../domain/repository/IReviewRepository';
import { Review } from '../../../domain/models/Review';

export class ListAllReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(): Promise<Review[]> {
    return this.reviewRepository.findAll();
  }
}
