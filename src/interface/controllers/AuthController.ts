import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import { IUserRepository } from '../../domain/repository/IUserRepository';
import { NotFoundError } from '../../application/errors/appErrors';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly userRepository: IUserRepository
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const result = await this.registerUserUseCase.execute({ name, email, password });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUserUseCase.execute({ email, password });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new NotFoundError('Usuario no identificado en la sesión');
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
