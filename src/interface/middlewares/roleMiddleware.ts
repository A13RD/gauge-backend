import { Request, Response, NextFunction } from 'express';
import { Role } from '../../domain/models/User';

export function roleMiddleware(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: 'No autenticado',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Acceso restringido: privilegios insuficientes',
      });
      return;
    }

    next();
  };
}
