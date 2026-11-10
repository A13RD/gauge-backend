import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/services/JwtService';

const jwtService = new JwtService();

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'Token no proporcionado o inválido',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwtService.verify(token);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (_error) {
    res.status(401).json({
      message: 'Token inválido o expirado',
    });
  }
}
