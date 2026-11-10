import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import { PrismaUserRepository } from '../../infrastructure/repository/PrismaUserRepository';
import { BcryptService } from '../../infrastructure/services/BcryptService';
import { JwtService } from '../../infrastructure/services/JwtService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

export const authRoutes = Router();

const userRepository = new PrismaUserRepository();
const bcryptService = new BcryptService();
const jwtService = new JwtService();

const registerUserUseCase = new RegisterUserUseCase(userRepository, bcryptService, jwtService);
const loginUserUseCase = new LoginUserUseCase(userRepository, bcryptService, jwtService);

const authController = new AuthController(registerUserUseCase, loginUserUseCase, userRepository);

// Rutas publicas
authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);

// Rutas protegidas
authRoutes.get('/me', authMiddleware, authController.me);

// Ruta de verificacion de autorizacion admin
authRoutes.get('/admin-only', authMiddleware, roleMiddleware(['ADMIN']), (_req, res) => {
  res.status(200).json({
    message: 'Acceso concedido a zona administrativa',
  });
});
