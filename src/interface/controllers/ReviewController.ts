import { Request, Response, NextFunction } from 'express';
import { CreateReviewUseCase } from '../../application/use-cases/reviews/CreateReviewUseCase';
import { GetMyReviewsUseCase } from '../../application/use-cases/reviews/GetMyReviewsUseCase';
import { ListAllReviewsUseCase } from '../../application/use-cases/reviews/ListAllReviewsUseCase';
import { GetReviewByIdUseCase } from '../../application/use-cases/reviews/GetReviewByIdUseCase';
import { UpdateReviewUseCase } from '../../application/use-cases/reviews/UpdateReviewUseCase';
import { SoftDeleteReviewUseCase } from '../../application/use-cases/reviews/SoftDeleteReviewUseCase';
import { UnauthorizedError } from '../../application/errors/appErrors';

export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getMyReviewsUseCase: GetMyReviewsUseCase,
    private readonly listAllReviewsUseCase: ListAllReviewsUseCase,
    private readonly getReviewByIdUseCase: GetReviewByIdUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly softDeleteReviewUseCase: SoftDeleteReviewUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para publicar una reseña');
      }

      const { gameId, rating, content, hoursPlayed } = req.body;
      const review = await this.createReviewUseCase.execute(req.user.id, {
        gameId,
        rating,
        content,
        hoursPlayed,
      });

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  };

  getMyReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para ver tus reseñas');
      }

      const reviews = await this.getMyReviewsUseCase.execute(req.user.id);
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviews = await this.listAllReviewsUseCase.execute();
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const review = await this.getReviewByIdUseCase.execute(id);
      res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para editar una reseña');
      }

      const id = String(req.params.id);
      const { rating, content, hoursPlayed } = req.body;

      const updated = await this.updateReviewUseCase.execute(id, req.user.id, req.user.role, {
        rating,
        content,
        hoursPlayed,
      });

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para eliminar una reseña');
      }

      const id = String(req.params.id);
      await this.softDeleteReviewUseCase.execute(id, req.user.id, req.user.role);

      res.status(200).json({
        message: 'Reseña eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}
