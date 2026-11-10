import { Router, Request, Response } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'gauge-backend',
    timestamp: new Date().toISOString(),
  });
});
