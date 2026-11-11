import { Request, Response, NextFunction } from 'express';
import { GetUserStatsUseCase } from '../../application/use-cases/stats/GetUserStatsUseCase';
import { UnauthorizedError } from '../../application/errors/appErrors';

export class UserController {
  constructor(private readonly getUserStatsUseCase: GetUserStatsUseCase) {}

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para consultar tus estadísticas');
      }

      const stats = await this.getUserStatsUseCase.execute(req.user.id);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };
}
