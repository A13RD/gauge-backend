import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { PrismaReviewRepository } from '../../infrastructure/repository/PrismaReviewRepository';
import { PrismaGameRepository } from '../../infrastructure/repository/PrismaGameRepository';
import { CreateReviewUseCase } from '../../application/use-cases/reviews/CreateReviewUseCase';
import { GetMyReviewsUseCase } from '../../application/use-cases/reviews/GetMyReviewsUseCase';
import { ListAllReviewsUseCase } from '../../application/use-cases/reviews/ListAllReviewsUseCase';
import { GetReviewByIdUseCase } from '../../application/use-cases/reviews/GetReviewByIdUseCase';
import { UpdateReviewUseCase } from '../../application/use-cases/reviews/UpdateReviewUseCase';
import { SoftDeleteReviewUseCase } from '../../application/use-cases/reviews/SoftDeleteReviewUseCase';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

export const reviewRoutes = Router();

const reviewRepository = new PrismaReviewRepository();
const gameRepository = new PrismaGameRepository();

const createReviewUseCase = new CreateReviewUseCase(reviewRepository, gameRepository);
const getMyReviewsUseCase = new GetMyReviewsUseCase(reviewRepository);
const listAllReviewsUseCase = new ListAllReviewsUseCase(reviewRepository);
const getReviewByIdUseCase = new GetReviewByIdUseCase(reviewRepository);
const updateReviewUseCase = new UpdateReviewUseCase(reviewRepository);
const softDeleteReviewUseCase = new SoftDeleteReviewUseCase(reviewRepository);

const reviewController = new ReviewController(
  createReviewUseCase,
  getMyReviewsUseCase,
  listAllReviewsUseCase,
  getReviewByIdUseCase,
  updateReviewUseCase,
  softDeleteReviewUseCase
);

// Crear reseña
reviewRoutes.post('/', authMiddleware, reviewController.create);

// Mis reseñas
reviewRoutes.get('/mias', authMiddleware, reviewController.getMyReviews);

// Listado general (ADMIN)
reviewRoutes.get('/', authMiddleware, roleMiddleware(['ADMIN']), reviewController.getAll);

// Detalle individual de reseña
reviewRoutes.get('/:id', reviewController.getById);

// Actualizar reseña (DMIN)
reviewRoutes.put('/:id', authMiddleware, reviewController.update);

// Eliminar reseña (ADMIN)
reviewRoutes.delete('/:id', authMiddleware, reviewController.delete);
