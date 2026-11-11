import { IReviewRepository } from '../../../domain/repository/IReviewRepository';
import { Role } from '../../../domain/models/User';
import { ForbiddenError, NotFoundError } from '../../errors/appErrors';

export class SoftDeleteReviewUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(id: string, userId: string, userRole: Role): Promise<void> {
    const existing = await this.reviewRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Reseña no encontrada o ya ha sido eliminada');
    }

    if (existing.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('No tienes autorización para eliminar esta reseña');
    }

    await this.reviewRepository.softDelete(id);
  }
}
