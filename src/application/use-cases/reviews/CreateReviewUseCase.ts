import { IReviewRepository } from '../../../domain/repository/IReviewRepository';
import { IGameRepository } from '../../../domain/repository/IGameRepository';
import { Review } from '../../../domain/models/Review';
import { BadRequestError, NotFoundError } from '../../errors/appErrors';

export interface CreateReviewDTO {
  gameId: string;
  rating: number;
  content: string;
  hoursPlayed: number;
}

export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly gameRepository: IGameRepository
  ) {}

  async execute(userId: string, dto: CreateReviewDTO): Promise<Review> {
    const { gameId, rating, content, hoursPlayed } = dto;

    if (!userId) {
      throw new BadRequestError('El identificador del usuario es obligatorio');
    }

    if (!gameId) {
      throw new BadRequestError('El identificador del juego es obligatorio');
    }

    const game = await this.gameRepository.findById(gameId);
    if (!game) {
      throw new NotFoundError('El videojuego especificado no existe o ha sido eliminado');
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || !Number.isInteger(numRating) || numRating < 1 || numRating > 10) {
      throw new BadRequestError('La calificación (rating) debe ser un número entero entre 1 y 10');
    }

    const numHours = Number(hoursPlayed);
    if (isNaN(numHours) || !Number.isInteger(numHours) || numHours < 0) {
      throw new BadRequestError(
        'Las horas jugadas (hoursPlayed) deben ser un número entero mayor o igual a 0'
      );
    }

    if (!content || content.trim().length < 5) {
      throw new BadRequestError('El contenido de la reseña debe contener al menos 5 caracteres');
    }

    return this.reviewRepository.create({
      userId,
      gameId,
      rating: numRating,
      content: content.trim(),
      hoursPlayed: numHours,
    });
  }
}
