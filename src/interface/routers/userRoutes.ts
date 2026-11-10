import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { PrismaReviewRepository } from '../../infrastructure/repository/PrismaReviewRepository';
import { GetUserStatsUseCase } from '../../application/use-cases/stats/GetUserStatsUseCase';
import { authMiddleware } from '../middlewares/authMiddleware';

export const userRoutes = Router();

const reviewRepository = new PrismaReviewRepository();
const getUserStatsUseCase = new GetUserStatsUseCase(reviewRepository);
const userController = new UserController(getUserStatsUseCase);

userRoutes.get('/stats', authMiddleware, userController.getStats);
