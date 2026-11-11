import { Router } from 'express';
import { healthRoutes } from './healthRoutes';
import { authRoutes } from './authRoutes';
import { gameRoutes } from './gameRoutes';
import { genreRoutes } from './genreRoutes';
import { reviewRoutes } from './reviewRoutes';
import { userRoutes } from './userRoutes';

export const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/games', gameRoutes);
apiRouter.use('/genres', genreRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/users', userRoutes);

