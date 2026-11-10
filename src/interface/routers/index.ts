import { Router } from 'express';
import { healthRoutes } from './healthRoutes';

export const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
