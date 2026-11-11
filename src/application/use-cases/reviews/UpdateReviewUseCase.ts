import { IReviewRepository } from '../../../domain/repository/IReviewRepository';
import { Review } from '../../../domain/models/Review';
import { Role } from '../../../domain/models/User';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors/appErrors';

export interface UpdateReviewDTO {
  rating?: number;
  content?: string;
  hoursPlayed?: number;
}

export class UpdateReviewUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(id: string, userId: string, userRole: Role, dto: UpdateReviewDTO): Promise<Review> {
    const existing = await this.reviewRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Reseña no encontrada o ha sido eliminada');
    }

    if (existing.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('No tienes autorización para modificar esta reseña');
    }

    let parsedRating: number | undefined = undefined;
    if (dto.rating !== undefined) {
      parsedRating = Number(dto.rating);
      if (
        isNaN(parsedRating) ||
        !Number.isInteger(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 10
      ) {
        throw new BadRequestError(
          'el rating debe ser un número entero entre 1 y 10'
        );
      }
    }

    let parsedHours: number | undefined = undefined;
    if (dto.hoursPlayed !== undefined) {
      parsedHours = Number(dto.hoursPlayed);
      if (isNaN(parsedHours) || !Number.isInteger(parsedHours) || parsedHours < 0) {
        throw new BadRequestError(
          'Las horas jugadas deben ser un número entero mayor o igual a 0'
        );
      }
    }

    if (dto.content !== undefined && dto.content.trim().length < 5) {
      throw new BadRequestError('El contenido de la reseña debe contener al menos 5 caracteres');
    }

    return this.reviewRepository.update(id, {
      rating: parsedRating,
      content: dto.content ? dto.content.trim() : undefined,
      hoursPlayed: parsedHours,
    });
  }
}
