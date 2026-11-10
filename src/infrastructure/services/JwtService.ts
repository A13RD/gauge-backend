import jwt from 'jsonwebtoken';
import { Role } from '../../domain/models/User';
import { env } from '../config/env';
import { UnauthorizedError } from '../../application/errors/appErrors';

export interface TokenPayload {
  id: string;
  role: Role;
}

export class JwtService {
  private readonly secret: string = env.JWT_SECRET;
  private readonly expiresIn: string = env.JWT_EXPIRES_IN;

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      if (!decoded || !decoded.id || !decoded.role) {
        throw new UnauthorizedError('Token malformado o inválido');
      }
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('El token de autenticación ha expirado');
      }
      throw new UnauthorizedError('Token de autenticación inválido');
    }
  }
}
